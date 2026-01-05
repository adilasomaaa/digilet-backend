import { PartialType } from '@nestjs/swagger';
import { CreateStudentLetterSubmissionDto } from './create-student-letter-submission.dto';

export class UpdateStudentLetterSubmissionDto extends PartialType(
  CreateStudentLetterSubmissionDto,
) {}
