import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StudentLetterStatus } from '@prisma/client';

export class CreateStudentLetterSubmissionDto {
  @ApiProperty({
    description: 'ID dari student',
  })
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @ApiProperty({
    description: 'ID dari letter',
  })
  @IsNotEmpty()
  @IsNumber()
  letterId: number;

  @ApiPropertyOptional({
    description: 'Nomor surat',
  })
  @IsOptional()
  @IsString()
  letterNumber?: string;

  @ApiProperty({
    description: 'Status surat',
    enum: StudentLetterStatus,
    default: StudentLetterStatus.pending,
  })
  @IsNotEmpty()
  @IsEnum(StudentLetterStatus)
  status: StudentLetterStatus;
}
