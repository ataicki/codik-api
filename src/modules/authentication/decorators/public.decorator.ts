import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PUBLIC_KEY = Symbol('PUBLIC_KEY');

export const Public = () => SetMetadata(PUBLIC_KEY, true);

export const isPublic = (ctx: ExecutionContext, reflector: Reflector) => {
  const _isPublic = reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
    ctx.getHandler(),
    ctx.getClass(),
  ]);
  return _isPublic;
};
