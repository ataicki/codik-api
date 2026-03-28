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
import { userResponseSchema } from '@modules/authentication/dtos/user-response.dto';
import { User } from '@generated/client';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  async signUp(signUpDto: SignUpDto, userAgent: string) {
    const user = await this.usersService.create(signUpDto);

    const { accessToken, refreshToken } = await this.issueTokens(
      user,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
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

    const { accessToken, refreshToken } = await this.issueTokens(
      user,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return userResponseSchema.parse(user);
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
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException();
    }

    const token = await this.usersService.findToken(userId, userAgent);
    if (!token) {
      throw new ForbiddenException();
    }

    const tokenMatches = await argon2.verify(token.hashedRt, refreshToken);
    if (!tokenMatches) {
      throw new ForbiddenException();
    }

    await this.usersService.deleteToken(userId, userAgent);

    const { accessToken, refreshToken: tokenRt } = await this.issueTokens(
      user,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: tokenRt,
      user,
    };
  }

  async issueTokens(user: User, userAgent: string) {
    const accessPayload: AccessPayload = { userId: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(accessPayload);

    const refreshPayload: RefreshPayload = { userId: user.id };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.envService.get('REFRESH_SECRET'),
      expiresIn: `${this.envService.get('REFRESH_EXP')}d`,
    } as JwtSignOptions);

    await this.usersService.upsertToken(user.id, refreshToken, userAgent);

    return {
      accessToken,
      refreshToken,
    };
  }
}
