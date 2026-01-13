import { ApiProperty } from '@nestjs/swagger';
import { InstitutionType } from '@prisma/client';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInstitutionDto {
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

  @ApiProperty({
    description: 'tipe',
    enum: ['faculty', 'study_program', 'university', 'institution'],
  })
  @IsNotEmpty({ message: 'tipe tidak boleh kosong' })
  @IsIn(['faculty', 'study_program', 'university', 'institution'], {
    message:
      'tipe harus berupa faculty, study_program, university, atau institution',
  })
  type: InstitutionType;
}
