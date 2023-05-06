import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VariableDto } from './variable.dto';

export class DatasetDto {
  @IsOptional()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  documentName?: string;

  @IsOptional()
  filename?: string;

  @IsOptional()
  documentSize?: number;

  @IsOptional()
  rows?: number;

  @IsBoolean()
  // Needed when using multipart/form-data
  @Transform(({ value }) => [true, 'enabled', 'true', 1, '1'].indexOf(value) > -1)
  isActive: boolean;

  @IsOptional()
  keywords?: string;

  @IsBoolean()
  // Needed when using multipart/form-data
  @Transform(({ value }) => [true, 'enabled', 'true', 1, '1'].indexOf(value) > -1)
  requiresPermission: boolean;

  @IsArray()
  // Needed when using multipart/form-data
  @Transform(({ value }) => JSON.parse(value) as VariableDto[], { toClassOnly: true })
  variables: VariableDto[];
}
