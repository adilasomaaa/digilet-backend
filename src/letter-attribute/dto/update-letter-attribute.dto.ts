import { PartialType } from '@nestjs/swagger';
import { CreateLetterAttributeDto } from './create-letter-attribute.dto';

export class UpdateLetterAttributeDto extends PartialType(
  CreateLetterAttributeDto,
) {
  
}
