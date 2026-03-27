import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthenticationService } from '@modules/authentication/authentication.service';
import { SignInDto } from '@modules/authentication/dtos/sign-in.dto';
import { SignUpDto } from '@modules/authentication/dtos/sign-up.dto';
import { AccessGuard } from '@modules/authentication/guards/access.guard';
import { RefreshGuard } from '@modules/authentication/guards/refresh.guard';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import {
  REFRESH_COOKIE,
  type RefreshPayload,
} from '@modules/authentication/types';
import { Public } from '@modules/authentication/decorators/public.decorator';
import { UserAgent } from '@modules/authentication/decorators/user-agent.decorator';
import { Cookie } from '@modules/authentication/decorators/cookie.decorator';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('sign-up')
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
  ) {
    const tokens = await this.authenticationService.signUp(dto, userAgent);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return { success: true };
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
  ) {
    const tokens = await this.authenticationService.signIn(dto, userAgent);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return { success: true };
  }

  @UseGuards(AccessGuard)
  @Get('me')
  me(@CurrentUser() user: RefreshPayload) {
    return user;
  }

  @Public()
  @UseGuards(RefreshGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @CurrentUser() user: RefreshPayload,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
    @Cookie(REFRESH_COOKIE) refreshToken: string,
  ) {
    await this.authenticationService.signOut(
      user.userId,
      refreshToken,
      userAgent,
    );

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { success: true };
  }

  @Public()
  @UseGuards(RefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: RefreshPayload,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
    @Cookie(REFRESH_COOKIE) refreshToken: string,
  ) {
    const { accessToken, refreshToken: newRefresh } =
      await this.authenticationService.refresh(
        user.userId,
        refreshToken,
        userAgent,
      );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }
}
