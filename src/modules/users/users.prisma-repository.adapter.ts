import { Injectable } from '@nestjs/common';

import { IUsersRepository } from '@modules/users/users.repository.port';
import { PrismaService } from '@/src/infra/prisma/prisma.service';
import { Parent, Role, Token, User } from '@/generated/prisma/client';
import { CreateUserDto } from '@modules/users/dtos/create-user.dto';

@Injectable()
export class UsersPrismaRepositoryAdapter implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  updateUser(
    userId: string,
    avatarUrl: string | undefined,
  ): Promise<User | null> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl,
      },
    });
  }

  create(passwordHash: string, createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role,

        student:
          createUserDto.role === Role.STUDENT
            ? {
                create: {
                  fullName: createUserDto.fullName,
                  age: createUserDto.age!,
                },
              }
            : undefined,

        parent:
          createUserDto.role === Role.PARENT
            ? {
                create: {
                  fullName: createUserDto.fullName,
                },
              }
            : undefined,

        courseCreator:
          createUserDto.role === Role.COURSE_CREATOR
            ? {
                create: {
                  fullName: createUserDto.fullName,
                },
              }
            : undefined,
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

  async findParentByUserId(userId: string): Promise<Parent | null> {
    return this.prisma.parent.findUnique({ where: { userId } });
  }

  async createChild(
    passwordHash: string,
    dto: CreateUserDto,
    parentId: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.STUDENT,
        student: {
          create: {
            fullName: dto.fullName,
            age: dto.age!,
            parentId,
          },
        },
      },
    });
  }
}
