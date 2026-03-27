import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@/src/infra/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
