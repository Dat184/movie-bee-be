import { UserRole } from 'src/enums/user-role';

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
}
