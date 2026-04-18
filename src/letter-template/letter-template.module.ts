import { Module } from '@nestjs/common';
import { LetterTemplateService } from './letter-template.service';
import { LetterTemplateController } from './letter-template.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LetterTemplateController],
  providers: [LetterTemplateService],
})
export class LetterTemplateModule {}
