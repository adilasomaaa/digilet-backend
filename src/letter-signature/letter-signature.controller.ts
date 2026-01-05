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
import { LetterSignatureService } from './letter-signature.service';
import { CreateLetterSignatureDto } from './dto/create-letter-signature.dto';
import { UpdateLetterSignatureDto } from './dto/update-letter-signature.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryLetterSignatureDto } from './dto/query-letter-signature.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('api/letter-signature')
export class LetterSignatureController {
  constructor(
    private readonly letterSignatureService: LetterSignatureService,
  ) {}

  @Post()
  @Public()
  async create(@Body() createDto: CreateLetterSignatureDto) {
    await this.letterSignatureService.create(createDto);
    return ApiResponse.success('Letter signature berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryLetterSignatureDto) {
    const result = await this.letterSignatureService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Letter signature berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.letterSignatureService.findOne(+id);
    return ApiResponse.successWithData(
      'Letter signature berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLetterSignatureDto,
  ) {
    await this.letterSignatureService.update(+id, updateDto);
    return ApiResponse.success('Letter signature berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.letterSignatureService.remove(+id);
    return ApiResponse.success('Letter signature berhasil dihapus');
  }
}
