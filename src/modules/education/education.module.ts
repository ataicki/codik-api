import { Module } from '@nestjs/common';
import { CourseController } from '@modules/education/presentation/course.controller';
import { MinioModule } from 'nestjs-minio-s3';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { CourseService } from '@modules/education/application/course.service';
import { CourseImageService } from '@modules/education/application/course-image.service';
import { ModuleService } from '@modules/education/application/module.service';
import { StepService } from '@modules/education/application/step.service';
import { ModuleController } from '@modules/education/presentation/module.controller';
import { StepController } from '@modules/education/presentation/step.controller';

@Module({
  imports: [
    MinioModule.forFeature({ bucketName: 'courses', policy: 'public' }),
    PrismaModule,
  ],
  controllers: [CourseController, ModuleController, StepController],
  providers: [CourseService, CourseImageService, ModuleService, StepService],
})
export class EducationModule {}
