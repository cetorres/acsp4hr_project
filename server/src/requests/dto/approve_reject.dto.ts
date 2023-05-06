import { IsNotEmpty, IsOptional } from 'class-validator';
import { RequestStatus } from '../entities/request.entity';

export class ApproveRejectDto {
  @IsOptional()
  requestId: number;

  @IsOptional()
  ownerId: string;

  @IsNotEmpty()
  status?: RequestStatus;
}
