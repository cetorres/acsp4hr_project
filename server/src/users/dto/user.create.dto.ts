import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Messages, RegExHelper } from '../../helpers';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, {
    message: Messages.PASSWORD_ALLOWED_FORMAT
  })
  password: string;

  @IsOptional()
  @IsString()
  salt?: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;

  @IsOptional()
  @IsString()
  secureToken?: string;
}
