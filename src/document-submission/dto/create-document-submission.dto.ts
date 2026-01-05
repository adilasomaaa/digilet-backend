import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDocumentSubmissionDto {
  @ApiProperty({
    description: 'ID dari student letter submission',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  studentLetterSubmissionId: number;

  @ApiProperty({
    description: 'ID dari letter document',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  letterDocumentId: number;
}
