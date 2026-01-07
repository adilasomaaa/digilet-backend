import { Module } from '@nestjs/common';
import { LetterAttributeService } from './letter-attribute.service';
import { LetterAttributeController } from './letter-attribute.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
  controllers: [LetterAttributeController],
  providers: [LetterAttributeService],
})
export class LetterAttributeModule {}