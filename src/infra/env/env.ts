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

  MINIO_HOST: z.string(),
  MINIO_PORT: z.coerce.number(),
  MINIO_REGION_NAME: z.string(),
  MINIO_USE_SSL: z.string(),
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
});

export type Env = z.infer<typeof envSchema>;
