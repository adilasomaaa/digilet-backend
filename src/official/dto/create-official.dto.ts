import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOfficialDto {
  @ApiProperty({ example: 'John Doe', description: 'Nama resmi' })
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123456789', description: 'Nomor identitas' })
  @IsNotEmpty({ message: 'Nomor identitas tidak boleh kosong' })
  @IsString()
  nip: string;

  @ApiProperty({ example: 'Dekan', description: 'Jabatan' })
  @IsNotEmpty({ message: 'Jabatan tidak boleh kosong' })
  @IsString()
  occupation: string;

  @ApiProperty({
    example: 1,
    description: 'institusi Id',
    nullable: true,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  institutionId?: number;
}
