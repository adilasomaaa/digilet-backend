import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportingStageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  stageName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  reportingPeriodeId: number;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Tanggal Mulai',
    required: false,
  })
  @IsDateString(
    {},
    {
      message:
        'Tanggal Mulai harus berupa format tanggal yang valid, contoh: 2000-01-01',
    },
  )
  @IsString({ message: 'Tanggal Mulai harus berupa teks' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Tanggal Selesai',
    required: false,
  })
  @IsDateString(
    {},
    {
      message:
        'Tanggal Selesai harus berupa format tanggal yang valid, contoh: 2000-01-01',
    },
  )
  @IsString({ message: 'Tanggal Selesai harus berupa teks' })
  @IsNotEmpty()
  endDate: string;
}