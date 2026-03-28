import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/src/infra/prisma/prisma.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
} from '@modules/education/presentation/dto/lesson.dto';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        content: dto.content ?? null,
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Урок не найден');
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findOne(id);

    return this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const step = await this.prisma.step.findFirst({
      where: { lessonId: id },
    });
    if (step) {
      throw new ForbiddenException(
        'Нельзя удалить урок привязанный к шагу. Сначала удалите шаг.',
      );
    }

    await this.prisma.lesson.delete({ where: { id } });
  }
}
