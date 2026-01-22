import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateStudentLetterSubmissionDto {
  @ApiProperty({
    description: 'ID dari letter',
  })
  @IsNotEmpty()
  @IsNumber()
  letterId: number;

  @ApiProperty({
    description: 'Daftar jawaban untuk atribut kustom',
    example: [{ attributeId: 1, content: 'Keperluan Dinas' }],
  })
  @IsOptional()
  attributes?: { attributeId: number; content: string }[] | string;

  @ApiProperty({
    description: 'Daftar dokumen untuk atribut kustom',
    example: [{ letterDocumentId: 1, file: 'Keperluan Dinas' }],
  })
  @IsOptional()
  documents?: { letterDocumentId: number; file: string }[] | string;
}
