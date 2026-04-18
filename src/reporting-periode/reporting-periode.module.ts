import { Module } from '@nestjs/common';
import { ReportingPeriodeService } from './reporting-periode.service';
import { ReportingPeriodeController } from './reporting-periode.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportingPeriodeController],
  providers: [ReportingPeriodeService],
})
export class ReportingPeriodeModule {}