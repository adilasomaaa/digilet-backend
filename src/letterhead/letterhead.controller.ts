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
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { LetterheadService } from './letterhead.service';
import { CreateLetterheadDto } from './dto/create-letterhead.dto';
import { UpdateLetterheadDto } from './dto/update-letterhead.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryLetterheadDto } from './dto/query-letterhead.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.services';

@Controller('api/letterhead')
export class LetterheadController {
  constructor(private readonly letterheadService: LetterheadService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'logo',
      new FileUploadService().getImageUploadOptions('header'),
    ),
  )
  async create(
    @Body() createDto: CreateLetterheadDto,
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: any,
  ) {
    await this.letterheadService.create(createDto, logo, req.user);
    return ApiResponse.success('Kop Surat berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterheadDto, @Req() req: any) {
    const result = await this.letterheadService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Kop Surat berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterheadService.findOne(+id);
    return ApiResponse.successWithData('Kop Surat berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'logo',
      new FileUploadService().getImageUploadOptions('header'),
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterheadDto,
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: any,
  ) {
    await this.letterheadService.update(+id, updateDto, logo, req.user);
    return ApiResponse.success('Kop Surat berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.letterheadService.remove(+id, req.user);
    return ApiResponse.success('Kop Surat berhasil dihapus');
  }
}
