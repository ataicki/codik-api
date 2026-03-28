import { Injectable } from '@nestjs/common';
import { InjectBucket } from 'nestjs-minio-s3/dist/decorators/inject-bucket.decorator';
import { MinioService } from 'nestjs-minio-s3';

@Injectable()
export class CourseImageService {
  constructor(
    @InjectBucket() private readonly bucketName: string,
    private readonly minioService: MinioService,
  ) {}

  async upload(
    file: Express.Multer.File,
  ): Promise<{ url: string; key: string }> {
    const ext = file.originalname.split('.').pop();
    const key = `courses/${Date.now()}.${ext}`;

    await this.minioService.upload(
      this.bucketName,
      key,
      file.buffer,
      file.mimetype,
    );

    const url = `${process.env.MINIO_URL}/${this.bucketName}/${key}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    await this.minioService.delete(this.bucketName, key);
  }
}
