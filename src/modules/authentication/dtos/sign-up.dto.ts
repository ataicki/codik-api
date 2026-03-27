import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { Role } from '@generated/enums';

const signUpSchema = z.object({
  email: z.string().meta({
    example: 'artem@gmail.com',
  }),
  password: z.string().meta({
    example: 'asdfjkl',
  }),
  fullName: z.string().meta({
    example: 'Artem Kosyrev',
  }),
  role: z.enum(Role).meta({
    example: 'STUDENT',
  }),
  age: z.coerce.number().optional().meta({
    example: 12,
  }),
});

export class SignUpDto extends createZodDto(signUpSchema) {}
