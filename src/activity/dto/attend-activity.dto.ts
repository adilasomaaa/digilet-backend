import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AttendActivityDto {
    @ApiProperty({ description: 'NIM for students or NIP for officials' })
    @IsNotEmpty()
    @IsString()
    identifier: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    latitude?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    longitude?: string;
}
