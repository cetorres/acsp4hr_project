import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ComputationRunStatus } from '../entities/computation_run.entity';

export class ComputationRunDto {
  @IsOptional()
  requestId?: number;

  @IsOptional()
  datasetId?: number;

  @IsNotEmpty()
  @IsNumber()
  computationId: number;

  @IsOptional()
  resultText?: string;

  @IsOptional()
  resultImage?: string;

  @IsNotEmpty()
  @IsEnum(ComputationRunStatus)
  runStatus: ComputationRunStatus;

  @IsOptional()
  variables?: string;
}
