import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;
}
