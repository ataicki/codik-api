import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateModuleDto,
  UpdateModuleDto,
  ReorderModuleDto,
} from '../presentation/dto/module.dto';
import { PrismaService } from '@/src/infra/prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(courseId: string, dto: CreateModuleDto, userId: string) {
    await this.checkCourseOwnership(courseId, userId);

    const lastModule = await this.prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });

    const order = lastModule ? lastModule.order + 1 : 1;

    return this.prisma.module.create({
      data: { title: dto.title, courseId, order },
      include: { steps: true },
    });
  }

  async update(id: string, dto: UpdateModuleDto, userId: string) {
    const module = await this.findOneOrThrow(id);
    await this.checkCourseOwnership(module.courseId, userId);

    return this.prisma.module.update({
      where: { id },
      data: dto,
      include: { steps: true },
    });
  }

  async remove(id: string, userId: string) {
    const module = await this.findOneOrThrow(id);
    await this.checkCourseOwnership(module.courseId, userId);

    await this.prisma.module.delete({ where: { id } });

    const remaining = await this.prisma.module.findMany({
      where: { courseId: module.courseId },
      orderBy: { order: 'asc' },
    });

    await Promise.all(
      remaining.map((m, i) =>
        this.prisma.module.update({
          where: { id: m.id },
          data: { order: i + 1 },
        }),
      ),
    );
  }

  async reorder(id: string, dto: ReorderModuleDto, userId: string) {
    const module = await this.findOneOrThrow(id);
    await this.checkCourseOwnership(module.courseId, userId);

    const modules = await this.prisma.module.findMany({
      where: { courseId: module.courseId },
      orderBy: { order: 'asc' },
    });

    const maxOrder = modules.length;
    if (dto.order > maxOrder) {
      throw new ForbiddenException(`Максимальный порядок: ${maxOrder}`);
    }

    const oldOrder = module.order;
    const newOrder = dto.order;

    await Promise.all(
      modules.map((m) => {
        let targetOrder = m.order;

        if (m.id === id) {
          targetOrder = newOrder;
        } else if (
          oldOrder < newOrder &&
          m.order > oldOrder &&
          m.order <= newOrder
        ) {
          targetOrder = m.order - 1;
        } else if (
          oldOrder > newOrder &&
          m.order < oldOrder &&
          m.order >= newOrder
        ) {
          targetOrder = m.order + 1;
        }

        return this.prisma.module.update({
          where: { id: m.id },
          data: { order: targetOrder },
        });
      }),
    );

    return this.prisma.module.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  private async findOneOrThrow(id: string) {
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
