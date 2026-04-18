import {
Controller,
Get,
Post,
Body,
Patch,
Param,
Delete,
UseGuards,
Query,
UseInterceptors,
UploadedFile,
Req,
Res,
} from '@nestjs/common';
import { StudentReportService } from './student-report.service';
import { CreateStudentReportDto } from './dto/create-student-report.dto';
import { UpdateStudentReportDto } from './dto/update-student-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryStudentReportDto } from './dto/query-student-report.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.services';
import { VerifyStudentReportDto } from './dto/verify-student-report.dto';
import type { Response } from 'express';

@Controller('api/student-report')
export class StudentReportController {
    constructor(private readonly studentReportService: StudentReportService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(
        FileInterceptor(
          'documentProved',
          new FileUploadService().getImageUploadOptions('documentProved', 3),
        ),
      )
    async create(
        @Body() createDto: CreateStudentReportDto, 
        @UploadedFile() file: Express.Multer.File, 
        @Req() req: any) {
            await this.studentReportService.create(createDto, file, req.user);
            return ApiResponse.success('Student-Report berhasil dibuat');
    }

    @Get('export')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async exportExcel(
        @Query() query: QueryStudentReportDto,
        @Req() req: any,
        @Res() res: Response,
    ) {
        const buffer = await this.studentReportService.exportExcel(query, req.user);
        const filename = `student-report-${Date.now()}.xlsx`;
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async findAll(@Query() query: QueryStudentReportDto, @Req() req: any) {
        const result = await this.studentReportService.findAll(query, req.user);
        return ApiResponse.successWithPaginate(
            'Student-Report berhasil diambil',
            result.data,
            result.meta,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async findOne(@Param('id') id: string) {
        const data = await this.studentReportService.findOne(+id);
        return ApiResponse.successWithData('Student-Report berhasil diambil', data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateStudentReportDto,
    ) {
        await this.studentReportService.update(+id, updateDto);
        return ApiResponse.success('Student-Report berhasil diubah');
    }
    
    @Patch(':id/verify')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async verify(
        @Param('id') id: string,
        @Body() verifyDto: VerifyStudentReportDto,
    ) {
        await this.studentReportService.verify(+id, verifyDto);
        return ApiResponse.success('Student-Report berhasil diubah');
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async remove(@Param('id') id: string) {
        await this.studentReportService.remove(+id);
        return ApiResponse.success('Student-Report berhasil dihapus');
    }
}