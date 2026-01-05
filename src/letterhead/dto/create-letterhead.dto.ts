import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLetterheadDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
    required: true,
  })
  @IsNotEmpty()
  letterId: number;

  @ApiProperty({
    example: 1,
    description: 'ID header',
    required: true,
  })
  @IsNotEmpty()
  headerId: number;
}
