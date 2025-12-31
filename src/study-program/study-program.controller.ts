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
import { StudyProgramService } from './study-program.service';
import { CreateStudyProgramDto } from './dto/create-study-program.dto';
import { UpdateStudyProgramDto } from './dto/update-study-program.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryStudyProgramDto } from './dto/query-study-program.dto';

@Controller('api/study-program')
export class StudyProgramController {
  constructor(private readonly studyProgramService: StudyProgramService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createStudyProgramDto: CreateStudyProgramDto) {
    await this.studyProgramService.create(createStudyProgramDto);
    return ApiResponse.success('Program studi berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryStudyProgramDto) {
    const result = await this.studyProgramService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Program studi berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.studyProgramService.findOne(+id);
    return ApiResponse.successWithData('Program studi berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateStudyProgramDto: UpdateStudyProgramDto,
  ) {
    await this.studyProgramService.update(+id, updateStudyProgramDto);
    return ApiResponse.success('Program studi berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.studyProgramService.remove(+id);
    return ApiResponse.success('Program studi berhasil dihapus');
  }
}
