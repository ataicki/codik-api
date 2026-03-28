import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request, Response } from 'express';

import { EnvService } from '@/src/infra/env/env.service';
import {
  ACCESS_COOKIE,
  AccessPayload,
  REFRESH_COOKIE,
  RefreshPayload,
} from '@modules/authentication/types';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly envService: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[REFRESH_COOKIE] as string,
      ]),
      secretOrKey: envService.get('REFRESH_SECRET'),
    });
  }

  validate(payload: RefreshPayload) {
    return {
      userId: payload.userId,
    };
  }
}
