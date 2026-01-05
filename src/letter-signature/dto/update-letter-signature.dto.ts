import { PartialType } from '@nestjs/swagger';
import { CreateLetterSignatureDto } from './create-letter-signature.dto';

export class UpdateLetterSignatureDto extends PartialType(CreateLetterSignatureDto) {}
