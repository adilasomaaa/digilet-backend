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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryAnnouncementDto } from './dto/query-announcement.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.services';

@Controller('api/announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getPdfUploadOptions('announcement'),
    ),
  )
  @ApiConsumes('multipart/form-data')
  async create(@Body() createDto: CreateAnnouncementDto,@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    await this.announcementService.create(createDto, file, req.user);
    return ApiResponse.success('Announcement berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryAnnouncementDto, @Req() req: any) {
    const result = await this.announcementService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Announcement berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.announcementService.findOne(+id);
    return ApiResponse.successWithData('Announcement berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getPdfUploadOptions('announcement'),
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnnouncementDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.announcementService.update(+id, updateDto, file);
    return ApiResponse.success('Announcement berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.announcementService.remove(+id);
    return ApiResponse.success('Announcement berhasil dihapus');
  }
}