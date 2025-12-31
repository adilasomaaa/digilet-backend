import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudyProgramDto {
  @ApiProperty({
    example: 'Teknik Informatika',
    description: 'Nama program studi',
  })
  @IsNotEmpty({ message: 'Nama program studi tidak boleh kosong' })
  name: string;

  @ApiProperty({
    example: 'Teknik Informatika',
    description: 'Alamat program studi',
  })
  @IsOptional()
  address: string;
}
