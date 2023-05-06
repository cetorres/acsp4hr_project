import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VariableDto {
  @IsOptional()
  datasetId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}
