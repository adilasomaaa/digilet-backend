import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLetterAttributeDto {
  @ApiProperty({
    description: 'ID dari surat',
  })
  @IsNotEmpty()
  @IsNumber()
  letterId: number;

  @ApiProperty({
    description: 'Nama atribut',
  })
  @IsNotEmpty()
  @IsString()
  attributeName: string;

  @ApiProperty({
    description: 'Placeholder',
  })
  @IsNotEmpty()
  @IsString()
  placeholder: string;

  @ApiProperty({
    description: 'Label',
  })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Tipe',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Apakah wajib diisi',
  })
  @IsNotEmpty()
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({
    description: 'Apakah visible',
  })
  @IsNotEmpty()
  @IsBoolean()
  isVisible: boolean;

  @ApiProperty({
    description: 'Apakah editable',
  })
  @IsNotEmpty()
  @IsBoolean()
  isEditable: boolean;
}
