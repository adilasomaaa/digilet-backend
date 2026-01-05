import { PartialType } from '@nestjs/mapped-types';
import { CreateLetterSignatureTemplateDto } from './create-letter-signature-template.dto';

export class UpdateLetterSignatureTemplateDto extends PartialType(
  CreateLetterSignatureTemplateDto,
) {}
