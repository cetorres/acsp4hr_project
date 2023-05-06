import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
