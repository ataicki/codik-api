import { Module } from '@nestjs/common';

import { ProfileService } from '@modules/profile/profile.service';
import { ProfileController } from '@modules/profile/profile.controller';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
