import { Injectable } from '@nestjs/common';
import { Role } from '@generated/enums';
import { UpdateProfileDto } from '@modules/profile/dtos/update-profile.dto';
import { PrismaService } from '@/src/infra/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string, role: Role) {
    switch (role) {
      case Role.STUDENT:
        return this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            student: {
              select: {
                fullName: true,
                age: true,
                parent: {
                  select: { fullName: true },
                },
              },
            },
          },
        });
      case Role.PARENT:
        return this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            parent: {
              select: {
                fullName: true,
                children: {
                  select: {
                    id: true,
                    fullName: true,
                    age: true,
                    user: {
                      select: {
                        email: true,
                        courses: {
                          select: {
                            enrolledAt: true,
                            completedAt: true,
                            course: {
                              select: {
                                id: true,
                                title: true,
                                image: {
                                  select: { url: true },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      case Role.COURSE_CREATOR:
        return this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            courseCreator: true,
          },
        });
    }
  }

  async updateProfile(
    userId: string,
    role: Role,
    updateProfileDto: UpdateProfileDto,
  ) {
    switch (role) {
      case Role.STUDENT:
        return this.prisma.student.update({
          where: { userId },
          data: {
            fullName: updateProfileDto.fullName,
            age: updateProfileDto.age,
          },
        });

      case Role.PARENT:
        return this.prisma.parent.update({
          where: { userId },
          data: { fullName: updateProfileDto.fullName },
        });

      case Role.COURSE_CREATOR:
        return this.prisma.courseCreator.update({
          where: { userId },
          data: { fullName: updateProfileDto.fullName },
        });
    }
  }
}
