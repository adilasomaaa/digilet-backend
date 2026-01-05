import { Module } from '@nestjs/common';
import { LetterSignatureService } from './letter-signature.service';
import { LetterSignatureController } from './letter-signature.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LetterSignatureController],
  providers: [LetterSignatureService],
})
export class LetterSignatureModule {}
