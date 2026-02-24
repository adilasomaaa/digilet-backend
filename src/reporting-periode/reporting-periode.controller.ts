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
Req,
} from '@nestjs/common';
import { ReportingPeriodeService } from './reporting-periode.service';
import { CreateReportingPeriodeDto } from './dto/create-reporting-periode.dto';
import { UpdateReportingPeriodeDto } from './dto/update-reporting-periode.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryReportingPeriodeDto } from './dto/query-reporting-periode.dto';

@Controller('api/reporting-periode')
export class ReportingPeriodeController {
    constructor(private readonly reportingPeriodeService: ReportingPeriodeService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async create(@Body() createDto: CreateReportingPeriodeDto, @Req() req: any) {
        await this.reportingPeriodeService.create(createDto, req.user);
        return ApiResponse.success('Reporting-Periode berhasil dibuat');
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async findAll(@Query() query: QueryReportingPeriodeDto, @Req() req: any) {
        const result = await this.reportingPeriodeService.findAll(query, req.user);
        return ApiResponse.successWithPaginate(
            'Reporting-Periode berhasil diambil',
            result.data,
            result.meta,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async findOne(@Param('id') id: string) {
        const data = await this.reportingPeriodeService.findOne(+id);
        return ApiResponse.successWithData('Reporting-Periode berhasil diambil', data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateReportingPeriodeDto,
    ) {
        await this.reportingPeriodeService.update(+id, updateDto);
        return ApiResponse.success('Reporting-Periode berhasil diubah');
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async remove(@Param('id') id: string) {
        await this.reportingPeriodeService.remove(+id);
        return ApiResponse.success('Reporting-Periode berhasil dihapus');
    }
}