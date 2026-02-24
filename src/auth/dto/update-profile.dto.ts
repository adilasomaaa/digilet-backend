import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({ description: 'Jabatan (Khusus Personnel/Operator)' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({
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

  @ApiPropertyOptional({ description: 'Jenis Kelamin (Khusus Mahasiswa)' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Tempat Lahir (Khusus Mahasiswa)' })
  @IsOptional()
  @IsString()
  birthplace?: string;

  @ApiPropertyOptional({ description: 'Alamat (Khusus Mahasiswa)' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Tahun Ajaran (Khusus Mahasiswa)' })
  @IsOptional()
  @IsString()
  classYear?: string;

  @ApiPropertyOptional({ description: 'Nomor Telepon (Khusus Mahasiswa)' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
