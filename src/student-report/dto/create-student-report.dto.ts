import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentReportDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  reportingStageId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  officialId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsOptional()
  documentProved?: string;
}