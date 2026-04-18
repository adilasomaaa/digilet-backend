import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryLetterAttributeDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'ID dari surat',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  letterId: number;

  @ApiProperty({
    description: 'Apakah editable',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;
}
