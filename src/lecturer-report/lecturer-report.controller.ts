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
import { LecturerReportService } from './lecturer-report.service';
import { CreateLecturerReportDto } from './dto/create-lecturer-report.dto';
import { UpdateLecturerReportDto } from './dto/update-lecturer-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryLecturerReportDto } from './dto/query-lecturer-report.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.services';
import type { Response } from 'express';

@Controller('api/lecturer-report')
export class LecturerReportController {
    constructor(private readonly lecturerReportService: LecturerReportService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(
        FileInterceptor(
          'documentProved',
          new FileUploadService().getImageUploadOptions('documentProved'),
        ),
      )
    async create(
        @Body() createDto: CreateLecturerReportDto, 
        @UploadedFile() file: Express.Multer.File, 
        @Req() req: any) {
            await this.lecturerReportService.create(createDto, file, req.user);
            return ApiResponse.success('Laporan Dosen berhasil dibuat');
    }

    @Get('export')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async exportExcel(
        @Query() query: QueryLecturerReportDto,
        @Req() req: any,
        @Res() res: Response,
    ) {
        const buffer = await this.lecturerReportService.exportExcel(query, req.user);
        const filename = `lecturer-report-${Date.now()}.xlsx`;
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
    async findAll(@Query() query: QueryLecturerReportDto, @Req() req: any) {
        const result = await this.lecturerReportService.findAll(query, req.user);
        return ApiResponse.successWithPaginate(
            'Laporan Dosen berhasil diambil',
            result.data,
            result.meta,
        );
    }

    @Get('to-verify')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async getReportsToVerify(@Query() query: QueryLecturerReportDto, @Req() req: any) {
        const result = await this.lecturerReportService.getReportsToVerify(query, req.user);
        return ApiResponse.successWithPaginate(
            'Laporan yang perlu diverifikasi berhasil diambil',
            result.data,
            result.meta,
        );
    }


    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async findOne(@Param('id') id: string) {
        const data = await this.lecturerReportService.findOne(+id);
        return ApiResponse.successWithData('Laporan Dosen berhasil diambil', data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateLecturerReportDto,
    ) {
        await this.lecturerReportService.update(+id, updateDto);
        return ApiResponse.success('Laporan Dosen berhasil diubah');
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async remove(@Param('id') id: string) {
        await this.lecturerReportService.remove(+id);
        return ApiResponse.success('Laporan Dosen berhasil dihapus');
    }

    @Patch(':id/verify')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async verify(
        @Param('id') id: string,
        @Body() verifyDto: any,
        @Req() req: any
    ) {
        await this.lecturerReportService.verify(+id, verifyDto, req.user);
        return ApiResponse.success('Laporan Dosen berhasil diverifikasi');
    }
}
