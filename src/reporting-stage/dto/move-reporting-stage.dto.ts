import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class MoveReportingStageDto {
  @ApiProperty({
    enum: ['UP', 'DOWN'],
    description: 'Arah perpindahan (UP atau DOWN)',
    example: 'UP',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['UP', 'DOWN'])
  direction: 'UP' | 'DOWN';
}
