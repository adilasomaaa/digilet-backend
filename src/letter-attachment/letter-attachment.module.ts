import { Module } from '@nestjs/common';
import { LetterAttachmentService } from './letter-attachment.service';
import { LetterAttachmentController } from './letter-attachment.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
  controllers: [LetterAttachmentController],
  providers: [LetterAttachmentService],
})
export class LetterAttachmentModule {}