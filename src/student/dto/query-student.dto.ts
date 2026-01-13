import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryStudentDto extends PaginationQueryDto {
  @ApiProperty({ example: 1, description: 'ID Program Studi', required: false })
  @IsOptional()
  institutionId?: number;
}
