import { Module } from '@nestjs/common';
import { ReportingStageService } from './reporting-stage.service';
import { ReportingStageController } from './reporting-stage.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportingStageController],
  providers: [ReportingStageService],
})
export class ReportingStageModule {}