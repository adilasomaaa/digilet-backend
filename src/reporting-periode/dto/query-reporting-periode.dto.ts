import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';


export class QueryReportingPeriodeDto extends PaginationQueryDto {
    verifyTarget?: 'student' | 'lecturer';
}