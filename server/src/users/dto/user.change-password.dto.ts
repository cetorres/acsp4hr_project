import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Messages, RegExHelper } from '../../helpers';

export class UserChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password, {
    message: Messages.PASSWORD_ALLOWED_FORMAT
  })
  newPassword: string;
}
