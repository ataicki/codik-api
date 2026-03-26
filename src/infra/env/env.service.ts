import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/src/infra/env/env';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService) {}

  get<T extends keyof Env>(key: T) {
    return this.configService.get<T>(key, { infer: true }) as Env[T];
  }
}
