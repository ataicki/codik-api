import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/src/infra/prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
} from '@modules/education/presentation/dto/course.dto';
import { CourseImageService } from '@modules/education/application/course-image.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseImageService: CourseImageService,
  ) {}

  async create(dto: CreateCourseDto, creatorId: string) {
    const creator = await this.prisma.courseCreator.findUnique({
      where: { userId: creatorId },
    });

    if (!creator)
      throw new ForbiddenException(
        'Только создатели курсов могут создавать курсы',
      );

    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseCreatorId: creator.id,
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        title: true,
        description: true,
        image: { select: { url: true } },
        courseCreator: {
          select: { fullName: true },
        },
        _count: { select: { modules: true } },
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        image: { select: { url: true } },
        courseCreator: { select: { fullName: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            steps: {
              orderBy: { order: 'asc' },
              include: {
                lesson: { select: { id: true, title: true } },
                test: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Курс не найден');
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, userId: string) {
    await this.checkOwnership(id, userId);

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  async uploadImage(id: string, file: Express.Multer.File, userId: string) {
    await this.checkOwnership(id, userId);

    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { image: true },
    });

    if (course?.image) {
      await this.courseImageService.delete(course.image.key);
      await this.prisma.file.delete({ where: { id: course.image.id } });
    }

    const { url, key } = await this.courseImageService.upload(file);

    const file_ = await this.prisma.file.create({ data: { url, key } });

    return this.prisma.course.update({
      where: { id },
      data: { imageId: file_.id },
      select: { id: true, imageId: true, image: { select: { url: true } } },
    });
  }

  async publish(id: string, userId: string) {
    await this.checkOwnership(id, userId);

    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { modules: true } } },
    });

    if (course?._count.modules === 0) {
      throw new BadRequestException(
        'Нельзя отправить на модерацию курс без модулей',
      );
    }

    return this.prisma.course.update({
      where: { id },
      data: { status: 'PENDING_MODERATION' },
    });
  }

  async enroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, isAvailable: true },
    });

    if (!course) throw new NotFoundException('Курс не найден или недоступен');

    return this.prisma.courseEnrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId },
      update: {},
    });
  }

  async getProgress(courseId: string, userId: string) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (!enrollment) throw new NotFoundException('Вы не записаны на этот курс');

    const totalSteps = await this.prisma.step.count({
      where: { module: { courseId } },
    });

    const completedSteps = await this.prisma.stepProgress.count({
      where: { userId, step: { module: { courseId } } },
    });

    return {
      totalSteps,
      completedSteps,
      percent:
        totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100),
      completedAt: enrollment.completedAt,
    };
  }

  private async checkOwnership(courseId: string, userId: string) {
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

  async approve(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) throw new NotFoundException('Курс не найден');

    if (course.status !== 'PENDING_MODERATION') {
      throw new ForbiddenException('Курс не ожидает модерации');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        isAvailable: true,
      },
    });
  }

  async reject(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) throw new NotFoundException('Курс не найден');

    return this.prisma.course.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async findPending() {
    return this.prisma.course.findMany({
      where: { status: 'PENDING_MODERATION' },
      include: {
        courseCreator: { select: { fullName: true } },
        image: { select: { url: true } },
      },
    });
  }

  async findMyCoursesAsCreator(
    userId: string,
    status?: 'PENDING_MODERATION' | 'PUBLISHED' | 'REJECTED',
  ) {
    const creator = await this.prisma.courseCreator.findUnique({
      where: { userId },
    });

    if (!creator) throw new ForbiddenException('Нет доступа');

    return this.prisma.course.findMany({
      where: {
        courseCreatorId: creator.id,
        ...(status ? { status } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        isAvailable: true,
        image: { select: { url: true } },
        courseCreator: { select: { fullName: true } },
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findEnrolledCourses(userId: string, completed?: boolean) {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: {
        userId,
        ...(completed === true ? { completedAt: { not: null } } : {}),
        ...(completed === false ? { completedAt: null } : {}),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            isAvailable: true,
            image: { select: { url: true } },
            courseCreator: { select: { fullName: true } },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => ({
      ...e.course,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    }));
  }
}
