import { ProfileService } from '@modules/profile/profile.service';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import { UpdateProfileDto } from '@modules/profile/dtos/update-profile.dto';
import type { AccessPayload } from '@modules/authentication/types';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiCookieAuth('accessToken')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Получить профиль' })
  @ApiOkResponse({ description: 'Профиль пользователя' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  getProfile(@CurrentUser() user: AccessPayload) {
    return this.profileService.getProfile(user.userId, user.role);
  }

  @Put()
  @ApiOperation({ summary: 'Обновить профиль' })
  @ApiOkResponse({ description: 'Обновлённый профиль' })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AccessPayload,
  ) {
    return this.profileService.updateProfile(user.userId, user.role, dto);
  }
}
