import { Module } from '@nestjs/common';
import { LetterDocumentService } from './letter-document.service';
import { LetterDocumentController } from './letter-document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LetterDocumentController],
  providers: [LetterDocumentService],
})
export class LetterDocumentModule {}
