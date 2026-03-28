import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const answerSchema = z.object({
  answer: z.string().min(1).meta({ example: 'Переменная хранит данные' }),
  isCorrect: z.boolean().meta({ example: false }),
});

const questionSchema = z.object({
  question: z.string().min(5).meta({ example: 'Что такое переменная?' }),
  answers: z.array(answerSchema).min(2).max(6),
});

export const createTestSchema = z.object({
  title: z.string().min(3).meta({ example: 'Итоговый тест по переменным' }),
  passingScore: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(80)
    .meta({ example: 80 }),
});

export const addQuestionsSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

export const submitTestSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.uuid(),
        answerId: z.uuid(),
      }),
    )
    .min(1),
});

const answerResponseSchema = z.object({
  id: z.uuid(),
  answer: z.string(),
  isCorrect: z.boolean(),
});

const questionResponseSchema = z.object({
  id: z.uuid(),
  question: z.string(),
  answers: z.array(answerResponseSchema),
});

export const testResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  passingScore: z.number(),
  questions: z.array(questionResponseSchema),
});

export const testAttemptResponseSchema = z.object({
  id: z.uuid(),
  score: z.number().meta({ example: 75 }),
  passed: z.boolean(),
  passingScore: z.number().meta({ example: 80 }),
  createdAt: z.string(),
  details: z.array(
    z.object({
      questionId: z.uuid(),
      question: z.string(),
      answerId: z.uuid(),
      isCorrect: z.boolean(),
    }),
  ),
});

export class CreateTestDto extends createZodDto(createTestSchema) {}
export class AddQuestionsDto extends createZodDto(addQuestionsSchema) {}
export class SubmitTestDto extends createZodDto(submitTestSchema) {}
export class TestResponseDto extends createZodDto(testResponseSchema) {}
export class TestAttemptResponseDto extends createZodDto(
  testAttemptResponseSchema,
) {}
