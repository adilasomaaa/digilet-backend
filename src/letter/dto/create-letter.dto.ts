import { ApiProperty } from '@nestjs/swagger';
import { LetterCategory, SignatureType } from '@prisma/client';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLetterDto {
  @ApiProperty({ example: 'Surat Pengantar', description: 'nama surat' })
  @IsNotEmpty({ message: 'nama surat tidak boleh kosong' })
  @IsString({ message: 'nama surat harus berupa string' })
  letterName: string;

  @ApiProperty({
    description: 'ID dari surat',
  })
  @IsOptional()
  @IsNumber()
  letterHeadId?: number;

  @ApiProperty({ example: '123/456/789', description: 'nomor surat' })
  @IsNotEmpty({ message: 'nomor surat tidak boleh kosong' })
  @IsString({ message: 'nomor surat harus berupa string' })
  referenceNumber: string;

  @ApiProperty({ example: '2023-09-10', description: 'tanggal kedaluwarsa' })
  @IsNotEmpty({ message: 'tanggal kedaluwarsa tidak boleh kosong' })
  expiredDate: number;

  @ApiProperty({ example: 1, description: 'nomor urut surat' })
  @IsNotEmpty({ message: 'nomor urut surat tidak boleh kosong' })
  letterNumberingStart: number;

  @ApiProperty({
    description: 'kategori surat',
    enum: ['faculty', 'study_program', 'university', 'all'],
  })
  @IsNotEmpty({ message: 'kategori surat tidak boleh kosong' })
  @IsIn(['faculty', 'study_program', 'university', 'all'], {
    message: 'tipe harus berupa faculty, study_program, university, atau all',
  })
  category: LetterCategory;

  @ApiProperty({
    description: 'jenis tanda tangan',
    enum: ['barcode', 'digital'],
  })
  @IsNotEmpty({ message: 'jenis tanda tangan tidak boleh kosong' })
  @IsIn(['barcode', 'digital'], {
    message: 'tipe harus berupa barcode atau digital',
  })
  signatureType: SignatureType;
}
