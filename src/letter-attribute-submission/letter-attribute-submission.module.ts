import { Module } from '@nestjs/common';
import { LetterAttributeSubmissionService } from './letter-attribute-submission.service';
import { LetterAttributeSubmissionController } from './letter-attribute-submission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
  controllers: [LetterAttributeSubmissionController],
  providers: [LetterAttributeSubmissionService],
})
export class LetterAttributeSubmissionModule {}