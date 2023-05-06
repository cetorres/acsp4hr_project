import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;

  @IsOptional()
  @IsString()
  secureToken: string;
}
