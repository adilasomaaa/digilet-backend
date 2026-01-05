import { PartialType } from '@nestjs/mapped-types';
import { CreateLetterDocumentDto } from './create-letter-document.dto';

export class UpdateLetterDocumentDto extends PartialType(
  CreateLetterDocumentDto,
) {}
