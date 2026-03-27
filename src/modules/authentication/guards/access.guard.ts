import { AuthGuard } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { isPublic } from '@modules/authentication/decorators/public.decorator';

@Injectable()
export class AccessGuard
  extends AuthGuard('jwt-access')
  implements CanActivate
{
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const _isPublic = isPublic(ctx, this.reflector);
    if (_isPublic) {
      return true;
    }

    return super.canActivate(ctx);
  }
}
