import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLetterSignatureDto {
  @ApiPropertyOptional({
    description: 'ID dari student letter submission',
  })
  @IsOptional()
  @IsNumber()
  studentLetterSubmissionId?: number;

  @ApiPropertyOptional({
    description: 'ID dari general letter submission',
  })
  @IsOptional()
  @IsNumber()
  generalLetterSubmissionId?: number;

  @ApiProperty({
    description: 'ID dari letter signature template',
  })
  @IsNotEmpty()
  @IsNumber()
  letterSignatureTemplateId: number;

  @ApiProperty({
    description: 'Signature (string)',
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
