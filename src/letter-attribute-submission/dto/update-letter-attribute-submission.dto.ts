import { PartialType } from '@nestjs/swagger';
import { CreateLetterAttributeSubmissionDto } from './create-letter-attribute-submission.dto';

export class UpdateLetterAttributeSubmissionDto extends PartialType(CreateLetterAttributeSubmissionDto) {}