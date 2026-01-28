import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SignatureType } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGeneralLetterSubmissionDto {
  @ApiProperty({
    description: 'ID dari letter',
  })
  @IsNotEmpty()
  @IsNumber()
  letterId: number;

  @ApiPropertyOptional({
    description: 'Nomor surat',
  })
  @IsOptional()
  @IsString()
  letterNumber?: string;

  @ApiPropertyOptional({
    description: 'Nama surat',
  })
  @IsString()
  name?: string;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Letter Date',
    required: false,
  })
  @IsDateString(
    {},
    {
      message:
        'Tanggal Surat harus berupa format tanggal yang valid, contoh: 2000-01-01',
    },
  )
  @IsOptional()
  @IsString({ message: 'Tanggal Surat harus berupa teks' })
  letterDate?: string;

  @ApiProperty({
    description: 'Daftar jawaban untuk atribut kustom',
    example: [{ attributeId: 1, content: 'Keperluan Dinas' }],
  })
  @IsOptional()
  @IsArray()
  attributes?: { attributeId: number; content: string }[];

  @ApiProperty({
    description: 'jenis tanda tangan',
    enum: ['barcode', 'digital'],
  })
  @IsNotEmpty({ message: 'jenis tanda tangan tidak boleh kosong' })
  @IsIn(['barcode', 'digital'], {
    message: 'tipe harus berupa barcode atau digital',
  })
  signatureType: SignatureType;

  @ApiPropertyOptional({
    description: 'carbon copy',
  })
  @IsOptional()
  @IsString()
  carbonCopy?: string;
}
