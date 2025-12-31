import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePersonnelDto {
  @ApiProperty({ example: 'John Doe', description: 'name of personnel' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @ApiProperty({ example: 'admin@example.com', description: 'email' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'Operator', description: 'position of personnel' })
  @IsNotEmpty({ message: 'Jabatan tidak boleh kosong' })
  position: string;

  @ApiProperty({
    example: 1,
    description: 'ID program studi',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Study Program ID harus berupa angka' })
  studyProgramId?: number;
}
