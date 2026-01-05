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
import { LetterheadService } from './letterhead.service';
import { CreateLetterheadDto } from './dto/create-letterhead.dto';
import { UpdateLetterheadDto } from './dto/update-letterhead.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryLetterheadDto } from './dto/query-letterhead.dto';

@Controller('api/letterhead')
export class LetterheadController {
  constructor(private readonly letterheadService: LetterheadService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterheadDto) {
    await this.letterheadService.create(createDto);
    return ApiResponse.success('Letterhead berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterheadDto) {
    const result = await this.letterheadService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letterhead berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterheadService.findOne(+id);
    return ApiResponse.successWithData('Letterhead berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterheadDto,
  ) {
    await this.letterheadService.update(+id, updateDto);
    return ApiResponse.success('Letterhead berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterheadService.remove(+id);
    return ApiResponse.success('Letterhead berhasil dihapus');
  }
}