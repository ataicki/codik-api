import { Module } from '@nestjs/common';
import { EnvService } from '@/src/infra/env/env.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@/src/infra/env/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
