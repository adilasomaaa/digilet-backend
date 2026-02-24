import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class VerifyStudentReportDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    notes: string;

    @ApiProperty()
    @IsBoolean()
    isVerified: boolean;
}