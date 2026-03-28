import { Role } from '@generated/enums';

export interface UserProfile {
  id: string;
  role: Role;
  fullName: string;
  age?: number;
}
