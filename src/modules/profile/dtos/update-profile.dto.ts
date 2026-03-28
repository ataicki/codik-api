import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  age: z.coerce.number().optional(),
});

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
