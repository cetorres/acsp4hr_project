import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../entities/request.entity';

export class RequestDto {
  @IsOptional()
  requestId?: number;

  @IsOptional()
  requesterId?: number;

  @IsNotEmpty()
  ownerId: string;

  @IsNotEmpty()
  datasetId: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description: string;

  @IsOptional()
  status?: RequestStatus;
}
