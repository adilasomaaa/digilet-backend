import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGeneralLetterSubmissionDto {
  @ApiProperty({
    description: 'ID dari user',
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

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
  letterDate?: string;
}
