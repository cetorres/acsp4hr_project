import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthMeDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  bio: string;
}
