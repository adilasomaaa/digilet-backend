import { Module } from '@nestjs/common';
import { LetterSignatureTemplateService } from './letter-signature-template.service';
import { LetterSignatureTemplateController } from './letter-signature-template.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LetterSignatureTemplateController],
  providers: [LetterSignatureTemplateService],
})
export class LetterSignatureTemplateModule {}
