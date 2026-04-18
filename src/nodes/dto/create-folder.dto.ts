import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Folder name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Parent folder ID (null for root)',
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
