import { PartialType } from '@nestjs/swagger';
import { CreateDocumentSubmissionDto } from './create-document-submission.dto';

export class UpdateDocumentSubmissionDto extends PartialType(
  CreateDocumentSubmissionDto,
) {}
