import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameNodeDto {
  @ApiProperty({
    description: 'New name for the node',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
