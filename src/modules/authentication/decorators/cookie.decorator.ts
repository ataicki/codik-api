import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookie = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    return (request?.cookies[data] as string) || '';
  },
);
