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
} from '@nestjs/common';
import { LetterService } from './letter.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryLetterDto } from './dto/query-letter.dto';

@Controller('api/letter')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterDto, @Req() req: any) {
    await this.letterService.create(createDto, req.user);
    return ApiResponse.success('Letter berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterDto, @Req() req: any) {
    const result = await this.letterService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Letter berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterService.findOne(+id);
    return ApiResponse.successWithData('Letter berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(@Param('id') id: string, @Body() updateDto: UpdateLetterDto) {
    await this.letterService.update(+id, updateDto);
    return ApiResponse.success('Letter berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterService.remove(+id);
    return ApiResponse.success('Letter berhasil dihapus');
  }
}
