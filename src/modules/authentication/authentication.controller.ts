import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from '@modules/authentication/authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  async register() {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async login() {}

  @Get('me')
  async me() {}

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async logout() {}

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  async refreshTokens() {}
}
