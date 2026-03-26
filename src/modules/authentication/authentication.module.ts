import { Module } from '@nestjs/common';
import { UsersModule } from '@modules/users/users.module';
import { AuthenticationService } from '@modules/authentication/authentication.service';
import { AuthenticationController } from '@modules/authentication/authentication.controller';

@Module({
  imports: [UsersModule],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
