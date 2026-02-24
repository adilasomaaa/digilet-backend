import { PartialType } from '@nestjs/swagger';
import { CreateLecturerReportDto } from './create-lecturer-report.dto';

export class UpdateLecturerReportDto extends PartialType(CreateLecturerReportDto) {}
