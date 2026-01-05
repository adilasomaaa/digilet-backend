import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryLetterheadDto extends PaginationQueryDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
    required: false,
  })
  letterId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID header',
    required: false,
  })
  headerId: number;
}
