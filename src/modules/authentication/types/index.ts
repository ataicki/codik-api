import { Request, Response } from 'express';
import { Role, User } from '@generated/client';

export interface AccessPayload {
  userId: string;
  role: Role;
}

export interface RefreshPayload {
  userId: string;
}

export interface RequestWithUser extends Request {
  user: User;
}

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';
