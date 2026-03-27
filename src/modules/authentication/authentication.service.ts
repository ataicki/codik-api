import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { UsersService } from '@modules/users/users.service';
import { SignUpDto } from '@modules/authentication/dtos/sign-up.dto';
import { SignInDto } from '@modules/authentication/dtos/sign-in.dto';
import { EnvService } from '@/src/infra/env/env.service';
import { AccessPayload, RefreshPayload } from '@modules/authentication/types';
import { UserResponseDto } from '@modules/authentication/dtos/user-response.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async signUp(signUpDto: SignUpDto, userAgent: string) {
    const user = await this.usersService.create(signUpDto);

    return this.issueTokens(user.id, userAgent);
  }

  async signIn(signInDto: SignInDto, userAgent: string) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      signInDto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    return this.issueTokens(user.id, userAgent);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return UserResponseDto.parse(user);
  }

  async signOut(userId: string, refreshToken: string, userAgent: string) {
    const token = await this.usersService.findToken(userId, userAgent);
    if (!token) {
      throw new ForbiddenException();
    }

    const tokenMatches = await argon2.verify(token.hashedRt, refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException();
    }

    await this.usersService.deleteToken(userId, userAgent);
  }

  async refresh(userId: string, refreshToken: string, userAgent: string) {
    const token = await this.usersService.findToken(userId, userAgent);
    if (!token) {
      throw new ForbiddenException();
    }

    const tokenMatches = await argon2.verify(token.hashedRt, refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException();
    }

    await this.usersService.deleteToken(userId, userAgent);

    return this.issueTokens(userId, userAgent);
  }

  async issueTokens(userId: string, userAgent: string) {
    const accessPayload: AccessPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(accessPayload);

    const refreshPayload: RefreshPayload = { userId };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.envService.get('REFRESH_SECRET'),
      expiresIn: `${this.envService.get('REFRESH_EXP')}d`,
    } as JwtSignOptions);

    await this.usersService.upsertToken(userId, refreshToken, userAgent);

    return {
      accessToken,
      refreshToken,
    };
  }
}
