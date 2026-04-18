import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async getStats(@Req() req: any) {
    const data = await this.dashboardService.getStats(req.user);
    return ApiResponse.successWithData('Berhasil mengambil data statistik', data);
  }

  @Get('charts')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async getCharts(@Req() req: any) {
    const data = await this.dashboardService.getCharts(req.user);
    return ApiResponse.successWithData('Berhasil mengambil data grafik', data);
  }

  @Get('recent-pending')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async getRecentPending(@Req() req: any) {
    const data = await this.dashboardService.getRecentPendingLetters(req.user);
    return ApiResponse.successWithData('Berhasil mengambil pengajuan terbaru', data);
  }

  @Get('recent-signatures')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async getRecentSignatures(@Req() req: any) {
    const data = await this.dashboardService.getRecentSignatures(req.user);
    return ApiResponse.successWithData('Berhasil mengambil tanda tangan terbaru', data);
  }
}
