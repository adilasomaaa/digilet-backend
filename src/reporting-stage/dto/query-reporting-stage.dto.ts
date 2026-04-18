import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsNumber } from 'class-validator';


export class QueryReportingStageDto extends PaginationQueryDto {
    @ApiProperty()
    @IsNumber()
    reportingPeriodeId: number;
}