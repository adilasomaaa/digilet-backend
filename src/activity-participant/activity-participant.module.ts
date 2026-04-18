import { Module } from '@nestjs/common';
import { ActivityParticipantService } from './activity-participant.service';
import { ActivityParticipantController } from './activity-participant.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityParticipantController],
  providers: [ActivityParticipantService],
  exports: [ActivityParticipantService],
})
export class ActivityParticipantModule {}