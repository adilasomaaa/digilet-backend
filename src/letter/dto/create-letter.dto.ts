import { ApiProperty } from '@nestjs/swagger';
import { LetterCategory, LetterStatus, SignatureType } from '@prisma/client';
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
  @IsOptional()
  @IsString({ message: 'nomor surat harus berupa string' })
  referenceNumber?: string;

  @ApiProperty({ example: '2023-09-10', description: 'tanggal kedaluwarsa' })
  expiredDate?: number;

  @ApiProperty({ example: 1, description: 'nomor urut surat' })
  letterNumberingStart?: number;

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
    description: 'kategori surat',
    enum: ['public', 'private'],
  })
  @IsNotEmpty({ message: 'kategori surat tidak boleh kosong' })
  @IsIn(['public', 'private'], {
    message: 'tipe harus berupa public atau private',
  })
  status: LetterStatus;

  @ApiProperty({
    example: 1,
    description: 'ID institution (untuk operator fakultas)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Institution ID harus berupa angka' })
  institutionId?: number;
}
