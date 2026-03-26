import { z } from 'zod';

export const envSchema = z.object({
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  PG_DATA: z.string(),

  PORT: z.coerce.number(),
});

export type Env = z.infer<typeof envSchema>;
