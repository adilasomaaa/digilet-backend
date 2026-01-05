import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateLetterDocumentDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
  })
  @IsInt()
  letterId: number;

  @ApiProperty({
    example: 'Surat Pengantar',
    description: 'Nama surat',
  })
  @IsString()
  documentName: string;

  @ApiProperty({
    example: 'pdf',
    description: 'Tipe file',
  })
  @IsString()
  @IsOptional()
  fileType?: string;

  @ApiProperty({
    example: true,
    description: 'Surat Pengantar',
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}
