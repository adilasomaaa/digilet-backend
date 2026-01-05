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
import { LetterDocumentService } from './letter-document.service';
import { CreateLetterDocumentDto } from './dto/create-letter-document.dto';
import { UpdateLetterDocumentDto } from './dto/update-letter-document.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryLetterDocumentDto } from './dto/query-letter-document.dto';

@Controller('api/letter-document')
export class LetterDocumentController {
  constructor(private readonly letterDocumentService: LetterDocumentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterDocumentDto) {
    await this.letterDocumentService.create(createDto);
    return ApiResponse.success('Letter Document berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterDocumentDto) {
    const result = await this.letterDocumentService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter Document berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterDocumentService.findOne(+id);
    return ApiResponse.successWithData(
      'Letter Document berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterDocumentDto,
  ) {
    await this.letterDocumentService.update(+id, updateDto);
    return ApiResponse.success('Letter Document berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterDocumentService.remove(+id);
    return ApiResponse.success('Letter Document berhasil dihapus');
  }
}
