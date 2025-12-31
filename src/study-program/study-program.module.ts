import { Module } from '@nestjs/common';
import { StudyProgramService } from './study-program.service';
import { StudyProgramController } from './study-program.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudyProgramController],
  providers: [StudyProgramService],
})
export class StudyProgramModule {}
