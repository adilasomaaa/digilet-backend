import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryStudentLetterSubmissionDto extends PaginationQueryDto {
  letterId?: number;
}
