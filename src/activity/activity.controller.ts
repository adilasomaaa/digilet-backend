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
Req
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryActivityDto } from './dto/query-activity.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('api/activity')
export class ActivityController {
    constructor(
        private readonly activityService: ActivityService,
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async create(@Body() createDto: CreateActivityDto, @Req() req: any) {
        await this.activityService.create(createDto, req);
        return ApiResponse.success('Activity berhasil dibuat');
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async findAll(@Query() query: QueryActivityDto) {
        const result = await this.activityService.findAll(query);
        return ApiResponse.successWithPaginate(
            'Activity berhasil diambil',
            result.data,
            result.meta,
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async findOne(@Param('id') id: string) {
        const data = await this.activityService.findOne(+id);
        return ApiResponse.successWithData('Activity berhasil diambil', data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateActivityDto,
    ) {
        await this.activityService.update(+id, updateDto);
        return ApiResponse.success('Activity berhasil diubah');
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('JWT-auth')
        async remove(@Param('id') id: string) {
        await this.activityService.remove(+id);
        return ApiResponse.success('Activity berhasil dihapus');
    }

    @Public()
    @Get('code/:uniqueCode')
    async findByCode(@Param('uniqueCode') uniqueCode: string) {
        const data = await this.activityService.findByCode(uniqueCode);
        return ApiResponse.successWithData('Activity berhasil diambil', data);
    }
}