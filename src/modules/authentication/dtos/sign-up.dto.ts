import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const signUpSchema = z.object({
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.coerce.number(),
});

export class SignUpDto extends createZodDto(signUpSchema) {}
