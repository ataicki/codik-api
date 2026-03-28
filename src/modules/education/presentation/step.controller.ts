import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StepService } from '../application/step.service';
import { CreateStepDto, ReorderStepDto, StepResponseDto } from './dto/step.dto';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import type { RefreshPayload } from '@modules/authentication/types';

@ApiTags('Steps')
@ApiBearerAuth()
@Controller()
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post('modules/:moduleId/steps')
  @ApiOperation({ summary: 'Добавить шаг в модуль' })
  @ApiResponse({ status: 201, type: StepResponseDto })
  async create(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateStepDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.stepService.create(moduleId, dto, user.userId);
  }

  @Delete('steps/:id')
  @ApiOperation({ summary: 'Удалить шаг' })
  @ApiResponse({ status: 200, description: 'Шаг удалён' })
  async remove(@Param('id') id: string, @CurrentUser() user: RefreshPayload) {
    return this.stepService.remove(id, user.userId);
  }

  @Patch('steps/:id/reorder')
  @ApiOperation({ summary: 'Изменить порядок шага' })
  @ApiResponse({ status: 200, type: StepResponseDto })
  async reorder(
    @Param('id') id: string,
    @Body() dto: ReorderStepDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.stepService.reorder(id, dto, user.userId);
  }

  @Post('steps/:id/complete')
  @ApiOperation({ summary: 'Отметить шаг пройденным' })
  @ApiResponse({ status: 201, description: 'Шаг отмечен пройденным' })
  async complete(@Param('id') id: string, @CurrentUser() user: RefreshPayload) {
    return this.stepService.complete(id, user.userId);
  }
}
