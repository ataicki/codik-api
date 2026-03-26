import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from '@/src/infra/env/env.module';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';

@Module({
  imports: [EnvModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
