import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ModuleService } from '../application/module.service';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import {
  CreateModuleDto,
  ModuleResponseDto,
  ReorderModuleDto,
  UpdateModuleDto,
} from '@modules/education/presentation/dto/module.dto';
import type { RefreshPayload } from '@modules/authentication/types';

@ApiTags('Modules')
@ApiBearerAuth()
@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('courses/:courseId/modules')
  @ApiOperation({ summary: 'Создать модуль в курсе' })
  @ApiResponse({ status: 201, type: ModuleResponseDto })
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.moduleService.create(courseId, dto, user.userId);
  }

  @Patch('modules/:id')
  @ApiOperation({ summary: 'Обновить модуль' })
  @ApiResponse({ status: 200, type: ModuleResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.moduleService.update(id, dto, user.userId);
  }

  @Delete('modules/:id')
  @ApiOperation({ summary: 'Удалить модуль' })
  @ApiResponse({ status: 200, description: 'Модуль удалён' })
  async remove(@Param('id') id: string, @CurrentUser() user: RefreshPayload) {
    return this.moduleService.remove(id, user.userId);
  }

  @Patch('modules/:id/reorder')
  @ApiOperation({ summary: 'Изменить порядок модуля' })
  @ApiResponse({ status: 200, type: ModuleResponseDto })
  async reorder(
    @Param('id') id: string,
    @Body() dto: ReorderModuleDto,
    @CurrentUser() user: RefreshPayload,
  ) {
    return this.moduleService.reorder(id, dto, user.userId);
  }
}
