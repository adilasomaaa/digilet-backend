import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
} from 'class-validator';

export class UpdateCCStudentLetterSubmissionDto {
    @ApiProperty({
        description: 'Daftar carbon copy',
    })
    @IsOptional()
    carbonCopy?: string;
}
