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
Res,
Request
} from '@nestjs/common';
import * as express from 'express';
import { ActivityParticipantService } from './activity-participant.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryActivityParticipantDto } from './dto/query-activity-participant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.services';
import { AttendActivityDto } from '../activity/dto/attend-activity.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('api/activity-participant')
export class ActivityParticipantController {
    constructor(private readonly activityParticipantService: ActivityParticipantService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async findAll(@Query() query: QueryActivityParticipantDto) {
        const result = await this.activityParticipantService.findAll(query);
        return ApiResponse.successWithPaginate(
            'Activity-Participant berhasil diambil',
            result.data,
            result.meta,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async findOne(@Param('id') id: string) {
        const data = await this.activityParticipantService.findOne(+id);
        return ApiResponse.successWithData('Activity-Participant berhasil diambil', data);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async remove(@Param('id') id: string) {
        await this.activityParticipantService.remove(+id);
        return ApiResponse.success('Activity-Participant berhasil dihapus');
    }

    @Public()
    @Post('attend/:uniqueCode')
    @UseInterceptors(
        FileInterceptor(
            'proofOfAttendance',
            new FileUploadService().getImageUploadOptions('proofOfAttendance', 3),
        ),
    )
    async attend(
        @Param('uniqueCode') uniqueCode: string,
        @Body() attendDto: AttendActivityDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        await this.activityParticipantService.attend(uniqueCode, attendDto, file);
        return ApiResponse.success('Absensi berhasil dilakukan');
    }

    @Public()
    @Get('check-location/:uniqueCode')
    async checkLocation(
        @Param('uniqueCode') uniqueCode: string,
        @Query('latitude') lat: string,
        @Query('longitude') lng: string
    ) {
        const result = await this.activityParticipantService.checkLocation(uniqueCode, +lat, +lng);
        return ApiResponse.successWithData('Lokasi berhasil dicek', result);
    }

    @Public()
    @Get('validate-participant/:uniqueCode')
    async validateParticipant(
        @Param('uniqueCode') uniqueCode: string,
        @Query('identifier') identifier: string
    ) {
        const result = await this.activityParticipantService.validateParticipant(uniqueCode, identifier);
        return ApiResponse.successWithData('Peserta valid', result);
    }

    @Patch(':id/verify')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async verify(@Param('id') id: string) {
        await this.activityParticipantService.verify(+id);
        return ApiResponse.success('Absensi berhasil diverifikasi');
    }

    @Post('verify-bulk')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async verifyBulk(@Body('ids') ids: number[]) {
        await this.activityParticipantService.verifyBulk(ids);
        return ApiResponse.success('Absensi massal berhasil diverifikasi');
    }

    @Get('export/excel/:activityId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async exportExcel(
        @Param('activityId') activityId: string,
        @Res() res: express.Response
    ) {
        const buffer = await this.activityParticipantService.exportExcel(+activityId);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=peserta-kegiatan-${activityId}.xlsx`);
        res.send(buffer);
    }

    @Get('export/pdf/:activityId')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async exportPdf(
        @Param('activityId') activityId: string,
        @Res() res: express.Response
    ) {
        const buffer = await this.activityParticipantService.exportPdf(+activityId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=peserta-kegiatan-${activityId}.pdf`);
        res.send(buffer);
    }

    @Get('my/activities')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async findMyActivities(@Request() req, @Query() query: QueryActivityParticipantDto) {
        const result = await this.activityParticipantService.findMyActivities(req.user.id, query);
        return ApiResponse.successWithPaginate(
            'Kegiatan saya berhasil diambil',
            result.data,
            result.meta,
        );
    }
}