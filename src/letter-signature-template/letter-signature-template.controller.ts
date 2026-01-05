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
import { LetterSignatureTemplateService } from './letter-signature-template.service';
import { CreateLetterSignatureTemplateDto } from './dto/create-letter-signature-template.dto';
import { UpdateLetterSignatureTemplateDto } from './dto/update-letter-signature-template.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryLetterSignatureTemplateDto } from './dto/query-letter-signature-template.dto';

@Controller('api/letter-signature-template')
export class LetterSignatureTemplateController {
  constructor(
    private readonly letterSignatureTemplateService: LetterSignatureTemplateService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterSignatureTemplateDto) {
    await this.letterSignatureTemplateService.create(createDto);
    return ApiResponse.success('Letter Signature Template berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterSignatureTemplateDto) {
    const result = await this.letterSignatureTemplateService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter Signature Template berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterSignatureTemplateService.findOne(+id);
    return ApiResponse.successWithData(
      'Letter Signature Template berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterSignatureTemplateDto,
  ) {
    await this.letterSignatureTemplateService.update(+id, updateDto);
    return ApiResponse.success('Letter Signature Template berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterSignatureTemplateService.remove(+id);
    return ApiResponse.success('Letter Signature Template berhasil dihapus');
  }
}
