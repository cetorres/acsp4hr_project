import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Messages, RegExHelper } from '../../helpers';

export class AuthRegisterDto {
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
  @IsString()
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
  @IsString()
  secureToken?: string;
}
