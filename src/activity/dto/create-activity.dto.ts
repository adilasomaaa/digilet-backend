import { ApiProperty } from '@nestjs/swagger';
import { ActivityTarget, CategoryActivity } from '@prisma/client';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  // Tambahkan property sesuai kebutuhan
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  activityName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: '2000-01-01',
    description: 'Tanggal Pelaksanaan',
    required: false,
  })
  @IsDateString(
    {},
    {
      message:
        'Tanggal Pelaksanaan harus berupa format tanggal yang valid, contoh: 2000-01-01',
    },
  )
  @IsString({ message: 'Tanggal Pelaksanaan harus berupa teks' })
  @IsNotEmpty()
  implementationDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: CategoryActivity;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  target: ActivityTarget;

  @ApiProperty()
  @IsOptional()
  @IsString()
  coordinates: string;

}