import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LessonService } from '@modules/education/application/lesson.service';
import { Roles } from '@modules/authentication/decorators/roles.decorator';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateLessonDto,
  LessonResponseDto,
  UpdateLessonDto,
} from '@modules/education/presentation/dto/lesson.dto';
import { Role } from '@generated/enums';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @Roles(Role.COURSE_CREATOR)
  @ApiOperation({ summary: 'Создать урок с markdown контентом' })
  @ApiCreatedResponse({ type: LessonResponseDto })
  @ApiForbiddenResponse({ description: 'Только создатели курсов' })
  create(@Body() dto: CreateLessonDto) {
    return this.lessonService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить урок с markdown контентом' })
  @ApiOkResponse({ type: LessonResponseDto })
  @ApiNotFoundResponse({ description: 'Урок не найден' })
  getContent(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.COURSE_CREATOR)
  @ApiOperation({ summary: 'Обновить урок' })
  @ApiOkResponse({ type: LessonResponseDto })
  @ApiForbiddenResponse({ description: 'Только создатели курсов' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.lessonService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.COURSE_CREATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить урок' })
  @ApiForbiddenResponse({
    description: 'Нельзя удалить урок привязанный к шагу',
  })
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }
}
