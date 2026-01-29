import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLetterSignatureDto {
  @ApiPropertyOptional({
    description: 'ID dari student letter submission',
  })
  @IsOptional()
  @IsNumber()
  studentLetterSubmissionId?: number;

  @ApiPropertyOptional({
    description: 'ID dari general letter submission',
  })
  @IsOptional()
  @IsNumber()
  generalLetterSubmissionId?: number;

  @ApiProperty({
    description: 'ID dari official',
  })
  @IsNotEmpty()
  @IsNumber()
  officialId: number;

  @ApiProperty({
    description: 'Apakah sudah mengakui',
  })
  @IsNotEmpty()
  @IsBoolean()
  isAcknowledged: boolean;

  @ApiProperty({
    description: 'Posisi',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    description: 'Jabatan',
  })
  @IsNotEmpty()
  @IsString()
  occupation: string;

  @ApiProperty({
    description: 'NIP',
  })
  @IsNotEmpty()
  @IsString()
  uniqueCode: string;
}
