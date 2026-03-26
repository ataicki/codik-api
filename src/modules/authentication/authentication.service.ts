import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  async register() {}

  async login() {}

  async logout() {}

  async refreshTokens() {}

  async issueTokens() {}
}
