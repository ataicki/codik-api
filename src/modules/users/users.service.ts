import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '@modules/users/users.repository.port';
import { UpdateUserDto } from '@modules/users/dtos/update-user.dto';
import { Role } from '@generated/enums';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await argon2.hash(createUserDto.password);

    return this.usersRepository.create(passwordHash, createUserDto);
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async upsertToken(userId: string, refreshToken: string, userAgent: string) {
    const hashedRt = await argon2.hash(refreshToken);
    return this.usersRepository.upsertToken(userId, hashedRt, userAgent);
  }

  async findToken(userId: string, userAgent: string) {
    return this.usersRepository.findToken(userId, userAgent);
  }

  async deleteToken(userId: string, userAgent: string) {
    return this.usersRepository.deleteToken(userId, userAgent);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.updateUser(userId, updateUserDto.avatarUrl);
  }

  async createChild(parentUserId: string, dto: CreateUserDto) {
    const parent = await this.usersRepository.findParentByUserId(parentUserId);
    if (!parent)
      throw new ForbiddenException('Только родители могут создавать детей');

    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email уже занят');

    const passwordHash = await argon2.hash(dto.password);

    return this.usersRepository.createChild(passwordHash, dto, parent.id);
  }
}
