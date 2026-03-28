import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TestService } from '../application/test.service';
import {
  CreateTestDto,
  AddQuestionsDto,
  SubmitTestDto,
  TestResponseDto,
  TestAttemptResponseDto,
} from './dto/test.dto';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import type { RefreshPayload } from '@modules/authentication/types';
import { Roles } from '@modules/authentication/decorators/roles.decorator';
import { RoleGuard } from '@modules/authentication/guards/role.guard';

@ApiTags('Tests')
@ApiBearerAuth()
@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @Roles('ADMIN', 'COURSE_CREATOR')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Создать тест' })
  @ApiResponse({ status: 201, type: TestResponseDto })
  async create(@Body() dto: CreateTestDto) {
    return this.testService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тест с вопросами' })
  @ApiResponse({ status: 200, type: TestResponseDto })
  async findOne(@Param('id') id: string) {
    return this.testService.findOne(id);
  }

  @Roles('ADMIN', 'COURSE_CREATOR')
  @Post(':id/questions')
  @ApiOperation({ summary: 'Добавить вопросы в тест' })
  @ApiResponse({ status: 201, type: TestResponseDto })
  async addQuestions(@Param('id') id: string, @Body() dto: AddQuestionsDto) {
    return this.testService.addQuestions(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Пройти тест' })
  @ApiResponse({ status: 201, type: TestAttemptResponseDto })
  async submit(
    @Param('id') id: string,
    @Body() dto: SubmitTestDto,
    @CurrentUser() { userId }: RefreshPayload,
  ) {
    return this.testService.submit(id, userId, dto);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'История попыток пользователя' })
  async getAttempts(
    @Param('id') id: string,
    @CurrentUser() { userId }: RefreshPayload,
  ) {
    return this.testService.getAttempts(id, userId);
  }
}
