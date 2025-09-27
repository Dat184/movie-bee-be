import { IsEmail, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { UserGender } from 'src/enums/user-gender';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;

  @IsNotEmpty({ message: 'Age should not be empty' })
  age: number;

  @IsNotEmpty({ message: 'Gender should not be empty' })
  @IsEnum(UserGender)
  gender: UserGender;
}

