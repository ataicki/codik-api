import { Token, User } from '@generated/client';

export interface IUsersRepository {
  create(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    age: number,
  ): Promise<User>;
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
