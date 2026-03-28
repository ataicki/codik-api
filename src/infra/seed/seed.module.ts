import { Module } from '@nestjs/common';
import { SeedService } from '@/src/infra/seed/seed.service';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SeedService],
})
export class SeedModule {}
