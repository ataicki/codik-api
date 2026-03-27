import { Token, User } from '@generated/client';
import { CreateUserDto } from '@modules/users/dtos/create-user.dto';

export interface IUsersRepository {
  create(passwordHash: string, dto: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  upsertToken(
    userId: string,
    hashedRt: string,
    userAgent: string,
  ): Promise<void>;
  findToken(userId: string, userAgent: string): Promise<Token | null>;
  deleteToken(userId: string, userAgent: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
