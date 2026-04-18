import { ApiProperty } from '@nestjs/swagger';
import { ReportScopes, ReportTargetUser } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReportingPeriodeDto {
  // Tambahkan property sesuai kebutuhan
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ReportTargetUser)
  targetUser: ReportTargetUser

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ReportScopes)
  scope: ReportScopes

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  institutionId: number;

}