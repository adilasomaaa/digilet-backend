import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementVisibleStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ditampilkan di',
    enum: ['public', 'student'],
  })
  @IsNotEmpty({ message: 'visibleAt tidak boleh kosong' })
  @IsIn(['public', 'student'], {
    message: 'visibleAt harus berupa public atau student',
  })
  visibleAt: AnnouncementVisibleStatus;

  @ApiProperty({
    description: 'status',  
  })
  @IsNotEmpty()
  @Transform(({ obj, key }) => {
    const value = obj[key];
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    example: 'http://example.com/image.jpg',
    description: 'Logo URL',
  })
  @IsOptional()
  file?: string;
}