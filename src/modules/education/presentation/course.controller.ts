import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseListItemDto,
  CourseDetailDto,
  EnrollmentDto,
  ProgressDto,
  UploadImageDto,
} from './dto/course.dto';
import { CourseService } from '../application/course.service';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import type { RefreshPayload } from '@modules/authentication/types';
import { RoleGuard } from '@modules/authentication/guards/role.guard';
import { Roles } from '@modules/authentication/decorators/roles.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Создать курс' })
  @ApiResponse({ status: 201, type: CourseListItemDto })
  @ApiResponse({
    status: 403,
    description: 'Только создатели курсов могут создавать курсы',
  })
  async create(
    @Body() dto: CreateCourseDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.courseService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Список опубликованных курсов' })
  @ApiResponse({ status: 200, type: [CourseListItemDto] })
  async findAll() {
    return this.courseService.findAll();
  }

  @Get('moderation/pending')
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Список курсов на модерации (админ)' })
  @ApiResponse({ status: 200, type: [CourseListItemDto] })
  async findPending() {
    return this.courseService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Курс со структурой модулей и шагов' })
  @ApiResponse({ status: 200, type: CourseDetailDto })
  @ApiResponse({ status: 404, description: 'Курс не найден' })
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить заголовок или описание' })
  @ApiResponse({ status: 200, type: CourseDetailDto })
  @ApiResponse({ status: 403, description: 'Нет доступа к этому курсу' })
  @ApiResponse({ status: 404, description: 'Курс не найден' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.courseService.update(id, dto, user.userId);
  }

  @Patch(':id/image')
  @ApiOperation({ summary: 'Загрузить обложку курса' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, type: UploadImageDto })
  @ApiResponse({ status: 403, description: 'Нет доступа к этому курсу' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.courseService.uploadImage(id, file, user.userId);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Отправить курс на модерацию' })
  @ApiResponse({ status: 200, type: CourseListItemDto })
  @ApiResponse({
    status: 403,
    description: 'Нельзя отправить курс без модулей',
  })
  @ApiResponse({ status: 404, description: 'Курс не найден' })
  async publish(@Param('id') id: string, @CurrentUser() user: RefreshPayload) {
    return this.courseService.publish(id, user.userId);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Записаться на курс' })
  @ApiResponse({ status: 201, type: EnrollmentDto })
  @ApiResponse({ status: 404, description: 'Курс не найден или недоступен' })
  async enroll(@Param('id') id: string, @CurrentUser() user: RefreshPayload) {
    return this.courseService.enroll(id, user.userId);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Прогресс пользователя по курсу' })
  @ApiResponse({ status: 200, type: ProgressDto })
  @ApiResponse({ status: 404, description: 'Вы не записаны на этот курс' })
  async progress(@Param('id') id: string, @CurrentUser() user: RefreshPayload) {
    return this.courseService.getProgress(id, user.userId);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Одобрить курс (админ)' })
  @ApiResponse({ status: 200, type: CourseListItemDto })
  async approve(@Param('id') id: string) {
    return this.courseService.approve(id);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Отклонить курс (админ)' })
  @ApiResponse({ status: 200, type: CourseListItemDto })
  async reject(@Param('id') id: string) {
    return this.courseService.reject(id);
  }
}
