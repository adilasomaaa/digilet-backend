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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { QueryInstitutionDto } from './dto/query-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { InstitutionService } from './institution.service';

@Controller('api/institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createInstitutionDto: CreateInstitutionDto) {
    await this.institutionService.create(createInstitutionDto);
    return ApiResponse.success('Institusi berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryInstitutionDto) {
    const result = await this.institutionService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Institusi berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.institutionService.findOne(+id);
    return ApiResponse.successWithData('Institusi berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateInstitusiDto: UpdateInstitutionDto,
  ) {
    await this.institutionService.update(+id, updateInstitusiDto);
    return ApiResponse.success('Institusi berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.institutionService.remove(+id);
    return ApiResponse.success('Institusi berhasil dihapus');
  }
}
