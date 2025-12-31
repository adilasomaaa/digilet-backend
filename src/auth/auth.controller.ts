import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Autentikasi')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.AuthService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const login = await this.AuthService.login(user);
    return ApiResponse.successWithData('Login berhasil', login);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Get('me')
  async me(@Request() req: any) {
    const userProfile = await this.AuthService.getProfile(req.user);
    return ApiResponse.successWithData(
      'Profil pengguna berhasil diambil',
      userProfile,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  async logout(@Request() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    await this.AuthService.logout(token);
    return ApiResponse.success('Logout berhasil');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const data = await this.AuthService.changePassword(id, changePasswordDto);
    return ApiResponse.success('Password berhasil diperbarui');
  }
}
