import { ApiProperty } from '@nestjs/swagger';
import { LetterCategory, SignatureType } from '@prisma/client';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateLetterDto {
  @ApiProperty({ example: 'Surat Pengantar', description: 'nama surat' })
  @IsNotEmpty({ message: 'nama surat tidak boleh kosong' })
  @IsString({ message: 'nama surat harus berupa string' })
  letterName: string;

  @ApiProperty({ example: '123/456/789', description: 'nomor surat' })
  @IsNotEmpty({ message: 'nomor surat tidak boleh kosong' })
  @IsString({ message: 'nomor surat harus berupa string' })
  referenceNumber: string;

  @ApiProperty({ example: '2023-09-10', description: 'tanggal kedaluwarsa' })
  @IsNotEmpty({ message: 'tanggal kedaluwarsa tidak boleh kosong' })
  @IsString({ message: 'tanggal kedaluwarsa harus berupa string' })
  expiredDate: number;

  @ApiProperty({ example: 1, description: 'nomor urut surat' })
  @IsNotEmpty({ message: 'nomor urut surat tidak boleh kosong' })
  @IsString({ message: 'nomor urut surat harus berupa string' })
  letterNumberingStart: number;

  @ApiProperty({
    description: 'kategori surat',
    enum: ['fakultas', 'jurusan', 'universitas', 'all'],
  })
  @IsNotEmpty({ message: 'kategori surat tidak boleh kosong' })
  @IsIn(['fakultas', 'jurusan', 'universitas', 'all'], {
    message: 'tipe harus berupa fakultas, jurusan, universitas, atau all',
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
