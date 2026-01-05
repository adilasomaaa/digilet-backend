import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { LetterCategory } from '@prisma/client';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryLetterDto extends PaginationQueryDto {
  @ApiProperty({ example: 1, description: 'ID Program Studi', required: false })
  @IsOptional()
  programStudyId?: number;

  @ApiProperty({
    description: 'kategori surat',
    enum: ['fakultas', 'jurusan', 'universitas', 'all'],
  })
  @IsOptional()
  @IsIn(['fakultas', 'jurusan', 'universitas', 'all'], {
    message: 'tipe harus berupa fakultas, jurusan, universitas, atau all',
  })
  category?: LetterCategory;
}
