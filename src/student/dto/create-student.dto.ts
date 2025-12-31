import { ApiProperty } from '@nestjs/swagger';
import {
  IsDataURI,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  fullname: string;

  @ApiProperty({ example: 1, description: 'Study program ID' })
  @IsNotEmpty({ message: 'Program studi tidak boleh kosong' })
  studyProgramId: number;

  @ApiProperty({ example: 'admin@example.com', description: 'email' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 123', description: 'Address' })
  @IsNotEmpty({ message: 'Alamat tidak boleh kosong' })
  @IsString({ message: 'Alamat harus berupa teks' })
  address: string;

  @ApiProperty({ example: '1234567890', description: 'NIM' })
  @IsNotEmpty({ message: 'NIM tidak boleh kosong' })
  @IsString({ message: 'NIM harus berupa teks' })
  nim: string;

  @ApiProperty({ example: '2021', description: 'Class year' })
  @IsNotEmpty({ message: 'Tahun angkatan tidak boleh kosong' })
  @IsString({ message: 'Tahun angkatan harus berupa teks' })
  class_year: string;

  @ApiProperty({
    example: '081234567890',
    description: 'Handphone number',
    required: false,
  })
  phone_number?: string;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Birthday',
    required: false,
  })
  @IsDateString(
    {},
    {
      message:
        'Tanggal lahir harus berupa format tanggal yang valid, contoh: 2000-01-01',
    },
  )
  @IsOptional() // Tambahkan ini karena required: false di Swagger
  @IsString({ message: 'Tanggal lahir harus berupa teks' })
  birthday?: string;

  @ApiProperty({
    example: 'Jakarta',
    description: 'Birthplace',
    required: false,
  })
  birthplace?: string;

  @ApiProperty({
    example: 'Laki-laki/Perempuan',
    description: 'Gender',
  })
  @IsNotEmpty({ message: 'Jenis kelamin tidak boleh kosong' })
  @IsString({ message: 'Jenis kelamin harus berupa teks' })
  gender: string;
}
