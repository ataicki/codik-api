import { Module } from '@nestjs/common';
import { CourseController } from '@modules/education/presentation/course.controller';
import { MinioModule } from 'nestjs-minio-s3';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { CourseService } from '@modules/education/application/course.service';
import { CourseImageService } from '@modules/education/application/course-image.service';

@Module({
  imports: [
    MinioModule.forFeature({ bucketName: 'courses', policy: 'public' }),
    PrismaModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseImageService],
})
export class EducationModule {}
