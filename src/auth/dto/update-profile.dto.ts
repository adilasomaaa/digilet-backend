import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({ description: 'Jabatan (Khusus Personnel/Operator)' })
  @IsOptional()
  @IsString()
  occupation?: string;
}
