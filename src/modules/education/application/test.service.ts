import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateTestDto,
  AddQuestionsDto,
  SubmitTestDto,
} from '../presentation/dto/test.dto';
import { PrismaService } from '@/src/infra/prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTestDto) {
    return this.prisma.test.create({
      data: {
        title: dto.title,
        passingScore: dto.passingScore,
      },
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: {
              select: { id: true, answer: true, isCorrect: true },
            },
          },
        },
      },
    });

    if (!test) throw new NotFoundException('Тест не найден');
    return test;
  }

  async addQuestions(testId: string, dto: AddQuestionsDto) {
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundException('Тест не найден');

    for (const q of dto.questions) {
      const correctCount = q.answers.filter((a) => a.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException(
          `Вопрос "${q.question}" должен иметь ровно один правильный ответ`,
        );
      }
    }

    await this.prisma.$transaction(
      dto.questions.map((q) =>
        this.prisma.question.create({
          data: {
            question: q.question,
            testId,
            answers: {
              create: q.answers,
            },
          },
        }),
      ),
    );

    return this.findOne(testId);
  }

  async submit(testId: string, userId: string, dto: SubmitTestDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: { answers: true },
        },
      },
    });

    if (!test) throw new NotFoundException('Тест не найден');

    if (dto.answers.length !== test.questions.length) {
      throw new BadRequestException(
        `Ожидается ${test.questions.length} ответов, получено ${dto.answers.length}`,
      );
    }

    let correct = 0;
    const details = dto.answers.map(({ questionId, answerId }) => {
      const question = test.questions.find((q) => q.id === questionId);
      if (!question)
        throw new BadRequestException(`Вопрос ${questionId} не найден в тесте`);

      const answer = question.answers.find((a) => a.id === answerId);
      if (!answer) throw new BadRequestException(`Ответ ${answerId} не найден`);

      if (answer.isCorrect) correct++;

      return {
        questionId,
        question: question.question,
        answerId,
        isCorrect: answer.isCorrect,
      };
    });

    const score = Math.round((correct / test.questions.length) * 100);
    const passed = score >= test.passingScore;

    const attempt = await this.prisma.testAttempt.create({
      data: {
        testId,
        userId,
        score,
        passed,
        questionAttempts: {
          create: dto.answers.map(({ questionId, answerId }) => ({
            questionId,
            answerId,
          })),
        },
      },
    });

    if (passed) {
      const step = await this.prisma.step.findFirst({
        where: { testId },
        include: { module: true },
      });

      if (step) {
        await this.prisma.stepProgress.upsert({
          where: { userId_stepId: { userId, stepId: step.id } },
          create: { userId, stepId: step.id },
          update: {},
        });

        await this.checkCourseCompletion(step.module.courseId, userId);
      }
    }

    return {
      id: attempt.id,
      score,
      passed,
      passingScore: test.passingScore,
      createdAt: attempt.createdAt,
      details,
    };
  }

  async getAttempts(testId: string, userId: string) {
    return this.prisma.testAttempt.findMany({
      where: { testId, userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        score: true,
        passed: true,
        createdAt: true,
      },
    });
  }

  private async checkCourseCompletion(courseId: string, userId: string) {
    const totalSteps = await this.prisma.step.count({
      where: { module: { courseId } },
    });

    const completedSteps = await this.prisma.stepProgress.count({
      where: { userId, step: { module: { courseId } } },
    });

    if (totalSteps === completedSteps && totalSteps > 0) {
      await this.prisma.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId } },
        data: { completedAt: new Date() },
      });
    }
  }
}
