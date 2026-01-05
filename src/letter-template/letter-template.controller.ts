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
import { LetterTemplateService } from './letter-template.service';
import { CreateLetterTemplateDto } from './dto/create-letter-template.dto';
import { UpdateLetterTemplateDto } from './dto/update-letter-template.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryLetterTemplateDto } from './dto/query-letter-template.dto';

@Controller('api/letter-template')
export class LetterTemplateController {
  constructor(private readonly letterTemplateService: LetterTemplateService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterTemplateDto) {
    await this.letterTemplateService.create(createDto);
    return ApiResponse.success('Letter Template berhasil dibuat');
  }

  @Post('upsert')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async upsert(@Body() createDto: CreateLetterTemplateDto) {
    const message = await this.letterTemplateService.upsert(createDto);
    return ApiResponse.success(message);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterTemplateDto) {
    const result = await this.letterTemplateService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter Template berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterTemplateService.findOne(+id);
    return ApiResponse.successWithData(
      'Letter Template berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterTemplateDto,
  ) {
    await this.letterTemplateService.update(+id, updateDto);
    return ApiResponse.success('Letter Template berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterTemplateService.remove(+id);
    return ApiResponse.success('Letter Template berhasil dihapus');
  }
}
