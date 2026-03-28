import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { Roles } from '@modules/authentication/decorators/roles.decorator';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CurrentUser } from '@modules/authentication/decorators/current-user.decorator';
import { Role } from '@generated/enums';
import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import type { AccessPayload } from '@modules/authentication/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('children')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: 'Создать аккаунт ребёнка' })
  @ApiCreatedResponse({ description: 'Аккаунт ребёнка создан' })
  @ApiForbiddenResponse({ description: 'Только для родителей' })
  createChild(@Body() dto: CreateUserDto, @CurrentUser() user: AccessPayload) {
    return this.usersService.createChild(user.userId, dto);
  }
}
