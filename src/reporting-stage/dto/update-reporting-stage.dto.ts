import { PartialType } from '@nestjs/swagger';
import { CreateReportingStageDto } from './create-reporting-stage.dto';

export class UpdateReportingStageDto extends PartialType(CreateReportingStageDto) {}