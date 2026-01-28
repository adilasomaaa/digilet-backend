import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsInt } from 'class-validator';

export class QueryLetterSignatureDto extends PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    studentLetterSubmissionId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    generalLetterSubmissionId?: number;
}
