import { UserGender } from 'src/enums/user-gender';
import { UserRole } from 'src/enums/user-role';

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: UserGender;
  role: UserRole;
  isVerified: boolean;
}
