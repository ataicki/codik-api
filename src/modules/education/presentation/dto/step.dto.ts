import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const stepResponseSchema = z.object({
  id: z.uuid(),
  order: z.number(),
  type: z.enum(['LESSON', 'TEST']),
  moduleId: z.uuid(),
  lessonId: z.uuid().nullable(),
  testId: z.uuid().nullable(),
  lesson: z.object({ id: z.uuid(), title: z.string() }).nullable(),
  test: z.object({ id: z.uuid(), title: z.string() }).nullable(),
});

export const createStepSchema = z.object({
  type: z.enum(['LESSON', 'TEST']).meta({ example: 'LESSON' }),
  contentId: z.uuid().meta({ example: 'uuid урока или теста' }),
});

export const reorderStepSchema = z.object({
  order: z.number().int().positive().meta({ example: 3 }),
});

export class CreateStepDto extends createZodDto(createStepSchema) {}
export class ReorderStepDto extends createZodDto(reorderStepSchema) {}
export class StepResponseDto extends createZodDto(stepResponseSchema) {}
