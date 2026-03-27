import { SetMetadata } from '@nestjs/common';
import { Role } from '@generated/enums';

export const ROLES_KEY = Symbol('ROLES_KEY');
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
