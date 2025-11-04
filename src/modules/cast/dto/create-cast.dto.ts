import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCastDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
