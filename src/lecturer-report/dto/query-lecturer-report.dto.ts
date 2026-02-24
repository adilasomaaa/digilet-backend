import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryLecturerReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  reportingStageId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  validatorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  reporterId?: number;

  @ApiPropertyOptional({ description: 'Filter by verification status: "true" = verified, "false" = not verified' })
  @IsOptional()
  @IsString()
  isVerified?: string;
}
