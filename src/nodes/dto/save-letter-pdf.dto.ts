import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SaveLetterPdfDto {
  @IsString()
  pdfPath: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
