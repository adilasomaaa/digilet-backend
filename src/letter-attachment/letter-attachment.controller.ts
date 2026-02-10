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
import { LetterAttachmentService } from './letter-attachment.service';
import { CreateLetterAttachmentDto } from './dto/create-letter-attachment.dto';
import { UpdateLetterAttachmentDto } from './dto/update-letter-attachment.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryLetterAttachmentDto } from './dto/query-letter-attachment.dto';

@Controller('api/letter-attachment')
export class LetterAttachmentController {
  constructor(private readonly letterAttachmentService: LetterAttachmentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterAttachmentDto) {
    await this.letterAttachmentService.create(createDto);
    return ApiResponse.success('Letter-Attachment berhasil dibuat');
  }

  @Post('upsert')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async upsert(@Body() createDto: CreateLetterAttachmentDto) {
    await this.letterAttachmentService.upsert(createDto);
    return ApiResponse.success('Lampiran berhasil dibuat/diperbarui');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterAttachmentDto) {
    const result = await this.letterAttachmentService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter-Attachment berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterAttachmentService.findOne(+id);
    return ApiResponse.successWithData('Letter-Attachment berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterAttachmentDto,
  ) {
    await this.letterAttachmentService.update(+id, updateDto);
    return ApiResponse.success('Letter-Attachment berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterAttachmentService.remove(+id);
    return ApiResponse.success('Letter-Attachment berhasil dihapus');
  }
}