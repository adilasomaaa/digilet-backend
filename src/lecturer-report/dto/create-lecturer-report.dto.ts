import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLecturerReportDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  reportingStageId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  validatorId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsOptional()
  documentProved?: string;
}
