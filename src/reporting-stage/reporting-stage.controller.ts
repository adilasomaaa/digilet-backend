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
} from '@nestjs/common';
import { ReportingStageService } from './reporting-stage.service';
import { CreateReportingStageDto } from './dto/create-reporting-stage.dto';
import { UpdateReportingStageDto } from './dto/update-reporting-stage.dto';
import { MoveReportingStageDto } from './dto/move-reporting-stage.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryReportingStageDto } from './dto/query-reporting-stage.dto';

@Controller('api/reporting-stage')
export class ReportingStageController {
    constructor(private readonly reportingStageService: ReportingStageService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async create(@Body() createDto: CreateReportingStageDto) {
        await this.reportingStageService.create(createDto);
        return ApiResponse.success('Reporting-Stage berhasil dibuat');
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async findAll(@Query() query: QueryReportingStageDto) {
        const result = await this.reportingStageService.findAll(query);
        return ApiResponse.successWithPaginate(
            'Reporting-Stage berhasil diambil',
            result.data,
            result.meta,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async findOne(@Param('id') id: string) {
        const data = await this.reportingStageService.findOne(+id);
        return ApiResponse.successWithData('Reporting-Stage berhasil diambil', data);
    }

    @Patch(':id/move')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async move(
        @Param('id') id: string,
        @Body() moveDto: MoveReportingStageDto,
    ) {
        await this.reportingStageService.move(+id, moveDto.direction);
        return ApiResponse.success('Reporting-Stage berhasil dipindahkan');
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateReportingStageDto,
    ) {
        await this.reportingStageService.update(+id, updateDto);
        return ApiResponse.success('Reporting-Stage berhasil diubah');
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async remove(@Param('id') id: string) {
        await this.reportingStageService.remove(+id);
        return ApiResponse.success('Reporting-Stage berhasil dihapus');
    }
}