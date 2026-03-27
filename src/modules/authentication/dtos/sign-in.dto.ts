import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const signInSchema = z.object({
  email: z.string().meta({
    example: 'artem@gmail.com',
  }),
  password: z.string().meta({
    example: 'asdfjkl',
  }),
});

export class SignInDto extends createZodDto(signInSchema) {}
