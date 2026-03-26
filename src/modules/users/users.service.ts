import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { CreateUserDto } from '@modules/users/dtos/create-user.dto';
import {
  type IUsersRepository,
  USERS_REPOSITORY,
} from '@modules/users/users.repository.port';

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
    return this.usersRepository.create(
      createUserDto.email,
      passwordHash,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.age,
    );
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
}
