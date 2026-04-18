import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLetterAttributeSubmissionDto {
  @ApiProperty({
    description: 'ID dari letter attribute',
  })
  @IsNotEmpty()
  @IsNumber()
  letterAttributeId: number;

  @ApiProperty({
    description: 'ID dari student letter submission',
  })
  @IsOptional()
  @IsNumber()
  studentLetterSubmissionId?: number;

  @ApiProperty({
    description: 'ID dari general letter submission',
  })
  @IsOptional()
  @IsNumber()
  generalLetterSubmissionId?: number;

  @ApiProperty({
    description: 'Content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
