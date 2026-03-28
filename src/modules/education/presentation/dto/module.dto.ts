import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const stepRefSchema = z.object({
  id: z.uuid(),
  order: z.number(),
  type: z.enum(['LESSON', 'TEST']),
  lesson: z.object({ id: z.string(), title: z.string() }).nullable(),
  test: z.object({ id: z.string(), title: z.string() }).nullable(),
});

const moduleResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  order: z.number(),
  courseId: z.uuid(),
  steps: z.array(stepRefSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createModuleSchema = z.object({
  title: z.string().min(3).max(100).meta({ example: 'Основы JavaScript' }),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderModuleSchema = z.object({
  order: z.number().int().positive().meta({ example: 2 }),
});

export class CreateModuleDto extends createZodDto(createModuleSchema) {}
export class UpdateModuleDto extends createZodDto(updateModuleSchema) {}
export class ReorderModuleDto extends createZodDto(reorderModuleSchema) {}
export class ModuleResponseDto extends createZodDto(moduleResponseSchema) {}
