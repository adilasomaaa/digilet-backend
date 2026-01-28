import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';


export class QueryLetterAttachmentDto extends PaginationQueryDto {
    @ApiProperty({
        description: 'ID dari general letter submission',
    })
    @IsOptional()
    generalLetterSubmissionId?: number;

    @ApiProperty({
        description: 'ID dari student letter submission',
    })
    @IsOptional()
    studentLetterSubmissionId?: number;
}