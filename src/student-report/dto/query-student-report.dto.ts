import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';


export class QueryStudentReportDto extends PaginationQueryDto {

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    reportingStageId?: number

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    studentId?: number

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    officialId?: number

    @ApiPropertyOptional({ description: 'Filter by verification status: "true" = verified, "false" = not verified' })
    @IsOptional()
    @IsString()
    isVerified?: string

}