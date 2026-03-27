import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.string(),

  DATABASE_URL: z.string(),

  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  PG_DATA: z.string(),

  ACCESS_SECRET: z.string(),
  ACCESS_EXP: z.coerce.number(),
  REFRESH_SECRET: z.string(),
  REFRESH_EXP: z.coerce.number(),
});

export type Env = z.infer<typeof envSchema>;
