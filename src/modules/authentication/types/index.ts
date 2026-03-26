import { Request, Response } from 'express';
import { User } from '@generated/client';

export interface AccessPayload {
  sub: string;
}
export interface RefreshPayload {
  userId: string;
}

export interface RequestWithUser extends Request {
  user: User;
}

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';
