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
import { LetterAttributeService } from './letter-attribute.service';
import { CreateLetterAttributeDto } from './dto/create-letter-attribute.dto';
import { UpdateLetterAttributeDto } from './dto/update-letter-attribute.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryLetterAttributeDto } from './dto/query-letter-attribute.dto';

@Controller('api/letter-attribute')
export class LetterAttributeController {
  constructor(
    private readonly letterAttributeService: LetterAttributeService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterAttributeDto) {
    await this.letterAttributeService.create(createDto);
    return ApiResponse.success('Letter-Attribute berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterAttributeDto) {
    const result = await this.letterAttributeService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter-Attribute berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterAttributeService.findOne(+id);
    return ApiResponse.successWithData(
      'Letter-Attribute berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterAttributeDto,
  ) {
    await this.letterAttributeService.update(+id, updateDto);
    return ApiResponse.success('Letter-Attribute berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterAttributeService.remove(+id);
    return ApiResponse.success('Letter-Attribute berhasil dihapus');
  }
}
