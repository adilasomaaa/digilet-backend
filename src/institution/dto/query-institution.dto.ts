import { ApiProperty } from '@nestjs/swagger';
import { InstitutionType } from '@prisma/client';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class QueryInstitutionDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'tipe',
    enum: ['faculty', 'study_program', 'university', 'institution'],
  })
  @IsIn(['faculty', 'study_program', 'university', 'institution'], {
    message:
      'tipe harus berupa faculty, study_program, university, atau institution',
  })
  @IsOptional()
  type?: InstitutionType;
}
