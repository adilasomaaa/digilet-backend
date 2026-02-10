import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryLetterAttributeSubmissionDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'ID dari letter attribute',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  letterAttributeId?: number;

  @ApiProperty({
    description: 'ID dari student letter submission',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  studentLetterSubmissionId?: number;

  @ApiProperty({
    description: 'ID dari general letter submission',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  generalLetterSubmissionId?: number;
}
