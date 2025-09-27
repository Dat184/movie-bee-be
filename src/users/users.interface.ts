import { UserGender } from 'src/enums/user-gender';
import { UserRole } from 'src/enums/user-role';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: UserGender;
  role: UserRole;
  // isVerified: boolean;
}
