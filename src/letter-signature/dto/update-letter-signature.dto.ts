import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLetterSignatureDto } from './create-letter-signature.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLetterSignatureDto extends PartialType(
  CreateLetterSignatureDto,
) {
  @ApiProperty({
    description: 'Signature (string)',
  })
  @IsOptional()
  @IsString()
  signature?: string;
}
