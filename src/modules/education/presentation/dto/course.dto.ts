import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(100)
    .meta({ example: 'JavaScript для самых маленьких' }),
  description: z
    .string()
    .min(10)
    .meta({ example: 'JavaScript - это язык, который делает сайты живыми' }),
});

export const updateCourseSchema = createCourseSchema.partial();

export class CreateCourseDto extends createZodDto(createCourseSchema) {}
export class UpdateCourseDto extends createZodDto(updateCourseSchema) {}

const courseImageSchema = z.object({
  url: z.string().meta({ example: 'http://minio:9000/courses/123.jpg' }),
});

const courseCreatorSchema = z.object({
  fullName: z.string().meta({ example: 'Косирев Сир' }),
});

const lessonRefSchema = z.object({
  id: z.string().uuid(),
  title: z.string().meta({ example: 'Что такое переменные' }),
});

const testRefSchema = z.object({
  id: z.uuid(),
  title: z.string().meta({ example: 'Проверка знаний' }),
});

const stepSchema = z.object({
  id: z.uuid(),
  order: z.number().meta({ example: 1 }),
  type: z.enum(['LESSON', 'TEST']),
  lesson: lessonRefSchema.nullable(),
  test: testRefSchema.nullable(),
});

const moduleSchema = z.object({
  id: z.uuid(),
  title: z.string().meta({ example: 'Основы JavaScript' }),
  order: z.number().meta({ example: 1 }),
  steps: z.array(stepSchema),
});

export const courseListItemSchema = z.object({
  id: z.string(),
  title: z.string().meta({ example: 'JavaScript для самых маленьких' }),
  description: z.string(),
  isAvailable: z.boolean(),
  status: z.enum(['PENDING_MODERATION', 'PUBLISHED', 'REJECTED']),
  image: courseImageSchema.nullable(),
  courseCreator: courseCreatorSchema.nullable(),
  _count: z.object({
    modules: z.number().meta({ example: 5 }),
  }),
});

export const courseDetailSchema = courseListItemSchema.extend({
  modules: z.array(moduleSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const enrollmentSchema = z.object({
  id: z.uuid(),
  courseId: z.uuid(),
  userId: z.uuid(),
  enrolledAt: z.string(),
  completedAt: z.string().nullable(),
});

export const progressSchema = z.object({
  totalSteps: z.number().meta({ example: 20 }),
  completedSteps: z.number().meta({ example: 12 }),
  percent: z.number().meta({ example: 60 }),
  completedAt: z.string().nullable(),
});

export const uploadImageSchema = z.object({
  id: z.uuid(),
  imageId: z.string(),
  image: courseImageSchema,
});

export class CourseListItemDto extends createZodDto(courseListItemSchema) {}
export class CourseDetailDto extends createZodDto(courseDetailSchema) {}
export class EnrollmentDto extends createZodDto(enrollmentSchema) {}
export class ProgressDto extends createZodDto(progressSchema) {}
export class UploadImageDto extends createZodDto(uploadImageSchema) {}
