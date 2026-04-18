import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';


export class QueryActivityParticipantDto extends PaginationQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    activityId?: string;
}