import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createLessonSchema = z.object({
  title: z.string().min(1).max(255).describe('Название урока'),
  content: z.string().optional().describe('Контент в формате Markdown'),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).max(255).optional().describe('Название урока'),
  content: z
    .string()
    .nullable()
    .optional()
    .describe('Контент в формате Markdown'),
});

const lessonResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class CreateLessonDto extends createZodDto(createLessonSchema) {}
export class UpdateLessonDto extends createZodDto(updateLessonSchema) {}
export class LessonResponseDto extends createZodDto(lessonResponseSchema) {}
