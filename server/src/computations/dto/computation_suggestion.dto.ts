import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ComputationSuggestionDto {
  @IsOptional()
  userId?: number;

  @IsNotEmpty()
  @IsString()
  suggestion: string;
}
