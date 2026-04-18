import { IsOptional, IsInt } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryLetterTemplateDto extends PaginationQueryDto {
  @IsOptional()
  @IsInt()
  letterId?: number;
}
