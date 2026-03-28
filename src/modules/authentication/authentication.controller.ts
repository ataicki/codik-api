import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthenticationService } from '@modules/authentication/authentication.service';
import { SignInDto } from '@modules/authentication/dtos/sign-in.dto';
import { SignUpDto } from '@modules/authentication/dtos/sign-up.dto';
import { AccessGuard } from '@modules/authentication/guards/access.guard';
import { RefreshGuard } from '@modules/authentication/guards/refresh.guard';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import {
  type AccessPayload,
  REFRESH_COOKIE,
  type RefreshPayload,
} from '@modules/authentication/types';
import { Public } from '@modules/authentication/decorators/public.decorator';
import { UserAgent } from '@modules/authentication/decorators/user-agent.decorator';
import { Cookie } from '@modules/authentication/decorators/cookie.decorator';
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  UserResponseDto,
  userResponseSchema,
} from '@modules/authentication/dtos/user-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Регистрация' })
  @ApiCreatedResponse({
    description: 'Данные пользователя',
    type: UserResponseDto,
  })
  @ApiConflictResponse({ description: 'Email уже занят' })
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

    return {
      user: userResponseSchema.parse(tokens.user),
    };
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход' })
  @ApiOkResponse({ description: 'Успешный вход' })
  @ApiUnauthorizedResponse({ description: 'Неверные данные' })
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

    return {
      user: userResponseSchema.parse(tokens.user),
    };
  }

  // @Roles(Role.STUDENT, Role.COURSE_CREATOR)
  @UseGuards(AccessGuard)
  @Get('me')
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiOkResponse({ description: 'Данные пользователя' })
  @ApiForbiddenResponse({ description: 'Не авторизован' })
  me(@CurrentUser() user: RefreshPayload) {
    return this.authenticationService.getMe(user.userId);
  }

  @Public()
  @UseGuards(RefreshGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Выход' })
  @ApiOkResponse({ description: 'Успешный выход' })
  @ApiForbiddenResponse({ description: 'Не авторизован' })
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
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiOkResponse({ description: 'Успешное обновление токенов' })
  @ApiForbiddenResponse({ description: 'Не авторизован' })
  async refresh(
    @CurrentUser() currentUser: AccessPayload,
    @Res({ passthrough: true }) res: Response,
    @UserAgent() userAgent: string,
    @Cookie(REFRESH_COOKIE) refreshToken: string,
  ) {
    const {
      accessToken,
      refreshToken: newRefresh,
      user,
    } = await this.authenticationService.refresh(
      currentUser.userId,
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

    return {
      user: userResponseSchema.parse(user),
    };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Загрузить аватар' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'URL загруженного аватара' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AccessPayload,
  ) {
    const avatarUrl = await this.authenticationService.uploadAvatar(
      user.userId,
      file,
    );

    return { avatarUrl };
  }

  @Delete('avatar')
  @ApiCookieAuth('accessToken')
  @ApiOperation({ summary: 'Удалить аватар' })
  @ApiOkResponse({ description: 'Аватар удалён' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  async removeAvatar(@CurrentUser() user: AccessPayload) {
    await this.authenticationService.deleteAvatar(user.userId);
    return { message: 'Avatar deleted successfully' };
  }
}
