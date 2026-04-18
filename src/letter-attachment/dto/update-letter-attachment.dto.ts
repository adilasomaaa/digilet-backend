import { PartialType } from '@nestjs/swagger';
import { CreateLetterAttachmentDto } from './create-letter-attachment.dto';

export class UpdateLetterAttachmentDto extends PartialType(CreateLetterAttachmentDto) {}