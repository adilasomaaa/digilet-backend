import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryLetterheadDto extends PaginationQueryDto {
  @ApiProperty({ example: 1, description: 'ID institusi', required: false })
  @IsOptional()
  institutionId?: number;

  @ApiProperty({ example: 1, description: 'ID User', required: false })
  @IsOptional()
  userId?: number;
}
