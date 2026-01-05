import { Module } from '@nestjs/common';
import { StudentLetterSubmissionService } from './student-letter-submission.service';
import { StudentLetterSubmissionController } from './student-letter-submission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LetterTemplateService } from 'src/common/services/letter-template.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentLetterSubmissionController],
  providers: [StudentLetterSubmissionService, LetterTemplateService],
})
export class StudentLetterSubmissionModule {}
