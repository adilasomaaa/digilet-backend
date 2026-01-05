import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
