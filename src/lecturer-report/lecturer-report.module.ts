import { Module } from '@nestjs/common';
import { LecturerReportService } from './lecturer-report.service';
import { LecturerReportController } from './lecturer-report.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LecturerReportController],
  providers: [LecturerReportService],
})
export class LecturerReportModule {}
