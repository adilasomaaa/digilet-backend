import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateLetterTemplateDto {
  @ApiProperty({
    example: 1,
    description: 'ID surat',
  })
  @IsInt()
  letterId: number;

  @ApiProperty({
    example: 'content',
    description: 'Content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
