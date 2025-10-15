import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly age?: number;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Phone number must be valid',
  })
  readonly phone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;
}
