import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryNodesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Parent folder ID (null for root)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({
    description: 'Include deleted items',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean;
}
