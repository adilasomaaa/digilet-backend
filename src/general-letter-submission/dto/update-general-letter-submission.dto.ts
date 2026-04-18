import { PartialType } from '@nestjs/swagger';
import { CreateGeneralLetterSubmissionDto } from './create-general-letter-submission.dto';

export class UpdateGeneralLetterSubmissionDto extends PartialType(
  CreateGeneralLetterSubmissionDto,
) {}
