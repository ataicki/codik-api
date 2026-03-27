import { Injectable } from '@nestjs/common';

import { IUsersRepository } from '@modules/users/users.repository.port';
import { PrismaService } from '@/src/infra/prisma/prisma.service';
import { Token, User } from '@/generated/prisma/client';

@Injectable()
export class UsersPrismaRepositoryAdapter implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  }
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async upsertToken(
    userId: string,
    hashedRt: string,
    userAgent: string,
  ): Promise<void> {
    const tokens = await this.prisma.token.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (tokens.length >= 5) {
      await this.prisma.token.delete({
        where: {
          hashedRt: tokens[0].hashedRt,
        },
      });
    }

    const existing = await this.prisma.token.findFirst({
      where: {
        userId,
        userAgent,
      },
    });

    if (existing) {
      await this.prisma.token.update({
        where: {
          hashedRt: existing.hashedRt,
        },
        data: {
          hashedRt,
        },
      });
    } else {
      await this.prisma.token.create({
        data: {
          hashedRt,
          userId,
          userAgent,
        },
      });
    }
  }

  findToken(userId: string, userAgent: string): Promise<Token | null> {
    return this.prisma.token.findFirst({
      where: { userId, userAgent },
    });
  }

  async deleteToken(userId: string, userAgent: string): Promise<void> {
    const token = await this.prisma.token.findFirst({
      where: { userId, userAgent },
    });
    if (!token) return;

    await this.prisma.token.delete({
      where: {
        hashedRt: token.hashedRt,
      },
    });
  }
}
