import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryLetterDocumentDto extends PaginationQueryDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
  })
  @IsOptional()
  @IsInt()
  letterId?: number;
}
