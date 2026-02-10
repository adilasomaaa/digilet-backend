import { Module } from '@nestjs/common';
import { DocumentSubmissionService } from './document-submission.service';
import { DocumentSubmissionController } from './document-submission.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentSubmissionController],
  providers: [DocumentSubmissionService],
})
export class DocumentSubmissionModule {}
