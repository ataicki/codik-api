import { Module } from '@nestjs/common';

import { EnvModule } from '@/src/infra/env/env.module';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthenticationModule } from '@modules/authentication/authentication.module';
import { ProfileModule } from '@modules/profile/profile.module';

@Module({
  imports: [
    EnvModule,
    PrismaModule,
    UsersModule,
    AuthenticationModule,
    ProfileModule,
  ],
})
export class AppModule {}
