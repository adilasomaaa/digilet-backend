import { PartialType } from '@nestjs/mapped-types';
import { CreateLetterTemplateDto } from './create-letter-template.dto';

export class UpdateLetterTemplateDto extends PartialType(
  CreateLetterTemplateDto,
) {}
