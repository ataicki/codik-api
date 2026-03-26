import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request, Response } from 'express';

import { EnvService } from '@/src/infra/env/env.service';
import { ACCESS_COOKIE, AccessPayload } from '@modules/authentication/types';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(private readonly envService: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[ACCESS_COOKIE] as string,
      ]),
      secretOrKey: envService.get('ACCESS_SECRET'),
    });
  }

  validate(payload: AccessPayload) {
    return {
      userId: payload.sub,
    };
  }
}
