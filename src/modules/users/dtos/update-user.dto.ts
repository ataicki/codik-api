import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateUserSchema = z.object({
  avatarUrl: z.string().optional(),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
