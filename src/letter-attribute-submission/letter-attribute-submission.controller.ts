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
import { LetterAttributeSubmissionService } from './letter-attribute-submission.service';
import { CreateLetterAttributeSubmissionDto } from './dto/create-letter-attribute-submission.dto';
import { UpdateLetterAttributeSubmissionDto } from './dto/update-letter-attribute-submission.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryLetterAttributeSubmissionDto } from './dto/query-letter-attribute-submission.dto';

@Controller('api/letter-attribute-submission')
export class LetterAttributeSubmissionController {
  constructor(private readonly letterAttributeSubmissionService: LetterAttributeSubmissionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateLetterAttributeSubmissionDto) {
    await this.letterAttributeSubmissionService.create(createDto);
    return ApiResponse.success('Letter-Attribute-Submission berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterAttributeSubmissionDto) {
    const result = await this.letterAttributeSubmissionService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter-Attribute-Submission berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterAttributeSubmissionService.findOne(+id);
    return ApiResponse.successWithData('Letter-Attribute-Submission berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterAttributeSubmissionDto,
  ) {
    await this.letterAttributeSubmissionService.update(+id, updateDto);
    return ApiResponse.success('Letter-Attribute-Submission berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterAttributeSubmissionService.remove(+id);
    return ApiResponse.success('Letter-Attribute-Submission berhasil dihapus');
  }
}