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
} from '@nestjs/common';
import { HeaderService } from './header.service';
import { CreateHeaderDto } from './dto/create-header.dto';
import { UpdateHeaderDto } from './dto/update-header.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryHeaderDto } from './dto/query-header.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.services';

@Controller('api/header')
export class HeaderController {
  constructor(private readonly headerService: HeaderService) {}

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
    @Body() createDto: CreateHeaderDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    await this.headerService.create(createDto, logo);
    return ApiResponse.success('Header berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryHeaderDto) {
    const result = await this.headerService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Header berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.headerService.findOne(+id);
    return ApiResponse.successWithData('Header berhasil diambil', data);
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
    @Body() updateDto: UpdateHeaderDto,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    await this.headerService.update(+id, updateDto, logo);
    return ApiResponse.success('Header berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.headerService.remove(+id);
    return ApiResponse.success('Header berhasil dihapus');
  }
}
