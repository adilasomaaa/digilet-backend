import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLetterAttachmentDto {
  @ApiProperty({
    description: 'ID dari general letter submission',
  })
  @IsOptional()
  @IsNumber({},{ message: 'ID dari general letter submission harus berupa angka' })
  generalLetterSubmissionId?: number;

  @ApiProperty({
    description: 'ID dari student letter submission',
  })
  @IsOptional()
  @IsNumber({},{ message: 'ID dari student letter submission harus berupa angka' })
  studentLetterSubmissionId?: number;

  @ApiProperty({
    example: 'content',
    description: 'Content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Apakah akan ditampilkan',
  })
  @IsNotEmpty()
  @IsBoolean()
  isVisible: boolean;
}