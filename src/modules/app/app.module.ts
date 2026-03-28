import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from '@/src/infra/env/env.module';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { AuthenticationModule } from '@modules/authentication/authentication.module';
import { EducationModule } from '@modules/education/education.module';
import { MinioModule } from 'nestjs-minio-s3';
import { EnvService } from '@/src/infra/env/env.service';

@Module({
  imports: [
    MinioModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        host: envService.get('MINIO_HOST'),
        port: envService.get('MINIO_PORT'),
        useSSL: envService.get('MINIO_USE_SSL') === 'true',
        accessKey: envService.get('MINIO_ROOT_USER'),
        secretKey: envService.get('MINIO_ROOT_PASSWORD'),
        region: envService.get('MINIO_REGION_NAME') || 'us-east-1',
      }),
    }),
    EnvModule,
    PrismaModule,
    UsersModule,
    AuthenticationModule,
    EducationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
