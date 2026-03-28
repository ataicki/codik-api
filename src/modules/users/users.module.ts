import { Module } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersPrismaRepositoryAdapter } from '@modules/users/users.prisma-repository.adapter';
import { USERS_REPOSITORY } from '@modules/users/users.repository.port';
import { PrismaModule } from '@/src/infra/prisma/prisma.module';
import { UsersController } from '@modules/users/users.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersPrismaRepositoryAdapter,
    },
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
