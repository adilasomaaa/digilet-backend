import { PartialType } from '@nestjs/swagger';
import { CreateReportingPeriodeDto } from './create-reporting-periode.dto';

export class UpdateReportingPeriodeDto extends PartialType(CreateReportingPeriodeDto) {}