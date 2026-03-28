import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '@/src/infra/prisma/prisma.service';
import { Role } from '@generated/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const passwordHash = await argon2.hash('kosar54321');
    const user = {
      email: 'rar@gmail.com',
      passwordHash,
      role: Role.ADMIN,
    };

    await this.prisma.user.upsert({
      where: { email: user.email },
      create: {
        ...user,
      },
      update: {
        ...user,
      },
    });
    this.logger.log('Admin successfully created');
  }
}
