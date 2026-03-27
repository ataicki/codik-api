import { z } from 'zod';

import { Role } from '@generated/enums';
import { createZodDto } from 'nestjs-zod';

export const userResponseSchema = z.object({
  id: z.string().meta({
    example: 'artem@gmail.com',
  }),
  email: z.string().meta({
    example: 'artem@gmail.com',
  }),
  role: z.enum(Role).meta({
    example: 'STUDENT',
  }),
  createdAt: z.string().meta({
    example: '2026-03-27T05:45:55.997Z',
  }),
});

export class UserResponseDto extends createZodDto(userResponseSchema) {}
