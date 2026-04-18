import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCCGeneralLetterSubmissionDto {
  @IsString()
  @IsOptional()
  carbonCopy?: string;
}