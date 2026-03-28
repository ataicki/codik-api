import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { AuthenticationService } from '@modules/authentication/authentication.service';
import { AuthenticationController } from '@modules/authentication/authentication.controller';
import { JwtModule, JwtModuleAsyncOptions } from '@nestjs/jwt';
import { EnvService } from '@/src/infra/env/env.service';
import { EnvModule } from '@/src/infra/env/env.module';
import { AccessStrategy } from '@modules/authentication/strategies/access.strategy';
import { RefreshStrategy } from '@modules/authentication/strategies/refresh.strategy';
import { AccessGuard } from '@modules/authentication/guards/access.guard';
import { RefreshGuard } from '@modules/authentication/guards/refresh.guard';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from '@modules/authentication/guards/role.guard';
import { MinioModule } from 'nestjs-minio-s3';

@Module({
  imports: [
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) =>
        ({
          secret: envService.get('ACCESS_SECRET'),
          signOptions: {
            expiresIn: `${envService.get('ACCESS_EXP')}m`,
          },
        }) as JwtModuleAsyncOptions,
    }),
    UsersModule,
    PrismaModule,
    MinioModule.forFeature({ bucketName: 'avatars', policy: 'public' }),
  ],
  providers: [
    AuthenticationService,
    AccessStrategy,
    RefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    RefreshGuard,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
