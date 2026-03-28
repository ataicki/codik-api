import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateStepDto, ReorderStepDto } from '../presentation/dto/step.dto';
import { PrismaService } from '@/src/infra/prisma/prisma.service';

@Injectable()
export class StepService {
  constructor(private readonly prisma: PrismaService) {}

  async create(moduleId: string, dto: CreateStepDto, userId: string) {
    const module = await this.findModuleOrThrow(moduleId);
    await this.checkCourseOwnership(module.courseId, userId);

    if (dto.type === 'LESSON') {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.contentId },
      });
      if (!lesson) throw new NotFoundException('Урок не найден');
    } else {
      const test = await this.prisma.test.findUnique({
        where: { id: dto.contentId },
      });
      if (!test) throw new NotFoundException('Тест не найден');
    }

    const lastStep = await this.prisma.step.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
    });

    const order = lastStep ? lastStep.order + 1 : 1;

    return this.prisma.step.create({
      data: {
        moduleId,
        order,
        type: dto.type,
        lessonId: dto.type === 'LESSON' ? dto.contentId : null,
        testId: dto.type === 'TEST' ? dto.contentId : null,
      },
      include: {
        lesson: { select: { id: true, title: true } },
        test: { select: { id: true, title: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const step = await this.findStepOrThrow(id);
    const module = await this.findModuleOrThrow(step.moduleId);
    await this.checkCourseOwnership(module.courseId, userId);

    await this.prisma.step.delete({ where: { id } });

    const remaining = await this.prisma.step.findMany({
      where: { moduleId: step.moduleId },
      orderBy: { order: 'asc' },
    });

    await Promise.all(
      remaining.map((s, i) =>
        this.prisma.step.update({
          where: { id: s.id },
          data: { order: i + 1 },
        }),
      ),
    );
  }

  async reorder(id: string, dto: ReorderStepDto, userId: string) {
    const step = await this.findStepOrThrow(id);
    const module = await this.findModuleOrThrow(step.moduleId);
    await this.checkCourseOwnership(module.courseId, userId);

    const steps = await this.prisma.step.findMany({
      where: { moduleId: step.moduleId },
      orderBy: { order: 'asc' },
    });

    const maxOrder = steps.length;
    if (dto.order > maxOrder) {
      throw new BadRequestException(`Максимальный порядок: ${maxOrder}`);
    }

    const oldOrder = step.order;
    const newOrder = dto.order;

    await Promise.all(
      steps.map((s) => {
        let targetOrder = s.order;

        if (s.id === id) {
          targetOrder = newOrder;
        } else if (
          oldOrder < newOrder &&
          s.order > oldOrder &&
          s.order <= newOrder
        ) {
          targetOrder = s.order - 1;
        } else if (
          oldOrder > newOrder &&
          s.order < oldOrder &&
          s.order >= newOrder
        ) {
          targetOrder = s.order + 1;
        }

        return this.prisma.step.update({
          where: { id: s.id },
          data: { order: targetOrder },
        });
      }),
    );

    return this.prisma.step.findUnique({
      where: { id },
      include: {
        lesson: { select: { id: true, title: true } },
        test: { select: { id: true, title: true } },
      },
    });
  }

  async complete(id: string, userId: string) {
    const step = await this.findStepOrThrow(id);

    const module = await this.prisma.module.findUnique({
      where: { id: step.moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId: module.courseId, userId } },
    });

    if (!enrollment)
      throw new ForbiddenException('Вы не записаны на этот курс');

    const progress = await this.prisma.stepProgress.upsert({
      where: { userId_stepId: { userId, stepId: id } },
      create: { userId, stepId: id },
      update: {},
    });

    await this.checkCourseCompletion(module.courseId, userId);

    return progress;
  }

  private async checkCourseCompletion(courseId: string, userId: string) {
    const totalSteps = await this.prisma.step.count({
      where: { module: { courseId } },
    });

    const completedSteps = await this.prisma.stepProgress.count({
      where: { userId, step: { module: { courseId } } },
    });

    if (totalSteps === completedSteps) {
      await this.prisma.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId } },
        data: { completedAt: new Date() },
      });
    }
  }

  private async findStepOrThrow(id: string) {
    const step = await this.prisma.step.findUnique({ where: { id } });
    if (!step) throw new NotFoundException('Шаг не найден');
    return step;
  }

  private async findModuleOrThrow(id: string) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) throw new NotFoundException('Модуль не найден');
    return module;
  }

  private async checkCourseOwnership(courseId: string, userId: string) {
    const creator = await this.prisma.courseCreator.findUnique({
      where: { userId },
    });
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException('Курс не найден');
    if (course.courseCreatorId !== creator?.id) {
      throw new ForbiddenException('Нет доступа к этому курсу');
    }
  }
}
