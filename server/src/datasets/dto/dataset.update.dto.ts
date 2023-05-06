import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VariableDto } from './variable.dto';

export class DatasetUpdateDto {
  @IsNotEmpty()
  id?: number;

  @IsOptional()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  keywords?: string;

  @IsBoolean()
  requiresPermission: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariableDto)
  variables: VariableDto[];
}
