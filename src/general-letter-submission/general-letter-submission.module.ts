import { Module } from '@nestjs/common';
import { GeneralLetterSubmissionService } from './general-letter-submission.service';
import { GeneralLetterSubmissionController } from './general-letter-submission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LetterTemplateService } from 'src/common/services/letter-template.service';

@Module({
  imports: [PrismaModule],
  controllers: [GeneralLetterSubmissionController],
  providers: [GeneralLetterSubmissionService, LetterTemplateService],
})
export class GeneralLetterSubmissionModule {}
