import { Module } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersPrismaRepositoryAdapter } from '@modules/users/users.prisma-repository.adapter';
import { USERS_REPOSITORY } from '@modules/users/users.repository.port';

@Module({
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersPrismaRepositoryAdapter,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
