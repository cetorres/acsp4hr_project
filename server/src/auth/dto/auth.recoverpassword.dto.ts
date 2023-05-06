import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Messages, RegExHelper } from 'src/helpers';

export class AuthRecoverPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  verificationCode: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, {
    message: Messages.PASSWORD_ALLOWED_FORMAT
  })
  password: string;
}
