import { ProfileService } from '@modules/profile/profile.service';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import { UpdateProfileDto } from '@modules/profile/dtos/update-profile.dto';
import type { AccessPayload } from '@modules/authentication/types';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: AccessPayload) {
    return this.profileService.getProfile(user.userId, user.role);
  }

  @Put()
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AccessPayload,
  ) {
    return this.profileService.updateProfile(user.userId, user.role, dto);
  }
}
