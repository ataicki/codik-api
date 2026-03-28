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
  avatarUrl: z.string().nullable().meta({
    example:
      'http://localhost:9001/courses/434ec34c-5eb9-430f-a3d1-a0c1de8c3001-1774688201680.jpg',
  }),
  role: z.enum(Role).meta({
    example: 'STUDENT',
  }),
  createdAt: z.coerce.string().meta({
    example: '2026-03-27T05:45:55.997Z',
  }),
});

export class UserResponseDto extends createZodDto(userResponseSchema) {}
