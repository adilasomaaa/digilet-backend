import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateLetterSignatureTemplateDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
  })
  @IsInt()
  letterId: number;

  @ApiProperty({
    example: 1,
    description: 'ID pejabat',
  })
  @IsInt()
  officialId: number;

  @ApiProperty({
    example: 'atas kiri',
    description: 'Posisi tanda tangan',
    required: false,
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({
    example: true,
    description: 'Apakah pejabat ini mengetahui surat ini?',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAcknowledged?: boolean;
}
