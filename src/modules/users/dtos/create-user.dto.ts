import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from '@generated/enums';

const createUserSchema = z.object({
  email: z.string(),
  password: z.string(),
  fullName: z.string(),
  role: z.enum(Role),
  age: z.coerce.number().optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
