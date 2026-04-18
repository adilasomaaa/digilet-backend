import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryAnnouncementDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'ID dari institution',
  })
  @IsOptional()
  @IsNumber()
  institutionId?: number;


  @ApiPropertyOptional({
    description: 'ID dari institution',
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}