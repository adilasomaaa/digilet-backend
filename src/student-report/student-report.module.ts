import { Module } from '@nestjs/common';
import { StudentReportService } from './student-report.service';
import { StudentReportController } from './student-report.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentReportController],
  providers: [StudentReportService],
})
export class StudentReportModule {}