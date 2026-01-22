import { ApiProperty } from '@nestjs/swagger';
import { SignatureType } from '@prisma/client';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class VerifyStudentLetterSubmissionDto {
  @ApiProperty({ description: 'Nomor Surat' })
  @IsString({ message: 'Nomor Surat harus berupa teks' })
  @IsNotEmpty({ message: 'Nomor Surat tidak boleh kosong' })
  letterNumber: string;
  
  @ApiProperty({ description: 'Tanggal Surat' })
  @IsDateString(
    {},
    {
      message:
        'Tanggal Surat harus berupa format tanggal yang valid, contoh: 2000-01-01',
    },
  )
  @IsNotEmpty({ message: 'Tanggal Surat tidak boleh kosong' })
  letterDate: string;

  @ApiProperty({
    description: 'Daftar jawaban untuk atribut kustom  dalam format JSON string',
    required: false,
  })
  @IsString()
  @IsOptional()
  attributes?: string;

  @ApiProperty({
    description: 'jenis tanda tangan',
    enum: ['barcode', 'digital'],
  })
  @IsNotEmpty({ message: 'jenis tanda tangan tidak boleh kosong' })
  @IsIn(['barcode', 'digital'], {
    message: 'tipe harus berupa barcode atau digital',
  })
  signatureType: SignatureType
}
