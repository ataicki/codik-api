import { Module } from '@nestjs/common';
import { PrismaService } from '@/src/infra/prisma/prisma.service';

@Module({
  providers: [PrismaService],
})
export class PrismaModule {}
