import { z } from 'zod';

import { Role } from '@generated/enums';

export const UserResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(Role),
  createdAt: z.date(),
});
