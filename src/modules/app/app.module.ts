import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from '@/src/infra/env/env.module';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthenticationModule } from '@modules/authentication/authentication.module';

@Module({
  imports: [EnvModule, PrismaModule, UsersModule, AuthenticationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
