import { Module } from '@nestjs/common';
import { LetterheadService } from './letterhead.service';
import { LetterheadController } from './letterhead.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LetterheadController],
  providers: [LetterheadService],
})
export class LetterheadModule {}
