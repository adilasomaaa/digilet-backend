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
import { PersonnelService } from './personnel.service';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryPersonnelDto } from './dto/query-personnel.dto';

@Controller('api/personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createPersonnelDto: CreatePersonnelDto) {
    await this.personnelService.create(createPersonnelDto);
    return ApiResponse.success('Personil berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryPersonnelDto) {
    const result = await this.personnelService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Personil berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.personnelService.findOne(+id);
    return ApiResponse.successWithData('Personil berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updatePersonnelDto: UpdatePersonnelDto,
  ) {
    await this.personnelService.update(+id, updatePersonnelDto);
    return ApiResponse.success('Personil berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.personnelService.remove(+id);
    return ApiResponse.success('Personil berhasil dihapus');
  }
}
