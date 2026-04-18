import { PartialType } from '@nestjs/swagger';
import { CreateLetterheadDto } from './create-letterhead.dto';

export class UpdateLetterheadDto extends PartialType(CreateLetterheadDto) {}
