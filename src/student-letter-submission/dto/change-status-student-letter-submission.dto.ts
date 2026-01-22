import { ApiProperty } from '@nestjs/swagger';
import { StudentLetterStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeStatusStudentLetterSubmissionDto {
  @ApiProperty({ enum: StudentLetterStatus })
  @IsEnum(StudentLetterStatus)
  @IsNotEmpty()
  status: StudentLetterStatus;
}
