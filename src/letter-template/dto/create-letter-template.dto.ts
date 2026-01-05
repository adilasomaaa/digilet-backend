import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateLetterTemplateDto {
  @IsInt()
  letterId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
