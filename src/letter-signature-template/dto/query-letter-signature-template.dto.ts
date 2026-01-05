import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryLetterSignatureTemplateDto extends PaginationQueryDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
    required: false,
  })
  @IsOptional()
  @IsInt()
  letterId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID pejabat',
    required: false,
  })
  @IsOptional()
  @IsInt()
  officialId?: number;
}
