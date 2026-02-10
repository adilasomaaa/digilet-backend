import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({
    description: 'Link name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Link content/URL',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID (null for root)',
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
