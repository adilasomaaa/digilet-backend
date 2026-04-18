import { Module } from '@nestjs/common';
import { OfficialService } from './official.service';
import { OfficialController } from './official.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OfficialController],
  providers: [OfficialService],
})
export class OfficialModule {}
