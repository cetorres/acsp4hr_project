import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ComputationReturnType } from '../entities/computation.entity';

export class ComputationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  scriptCommand: string;

  @IsNotEmpty()
  @IsEnum(ComputationReturnType)
  returnType: ComputationReturnType;

  @IsNumber()
  numberOfVariables: number;

  @IsBoolean()
  isActive: boolean;
}
