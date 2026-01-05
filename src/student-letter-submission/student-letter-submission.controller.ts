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
  Res,
  Req,
} from '@nestjs/common';
import { StudentLetterSubmissionService } from './student-letter-submission.service';
import { CreateStudentLetterSubmissionDto } from './dto/create-student-letter-submission.dto';
import { UpdateStudentLetterSubmissionDto } from './dto/update-student-letter-submission.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryStudentLetterSubmissionDto } from './dto/query-student-letter-submission.dto';
import { Response, Request } from 'express';

@Controller('api/student-letter-submission')
export class StudentLetterSubmissionController {
  constructor(
    private readonly studentLetterSubmissionService: StudentLetterSubmissionService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateStudentLetterSubmissionDto) {
    await this.studentLetterSubmissionService.create(createDto);
    return ApiResponse.success('Student letter submission berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryStudentLetterSubmissionDto) {
    const result = await this.studentLetterSubmissionService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Student letter submission berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id/print')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async print(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const html = await this.studentLetterSubmissionService.printLetter(+id, baseUrl);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.studentLetterSubmissionService.findOne(+id);
    return ApiResponse.successWithData(
      'Student letter submission berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentLetterSubmissionDto,
  ) {
    await this.studentLetterSubmissionService.update(+id, updateDto);
    return ApiResponse.success('Student letter submission berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.studentLetterSubmissionService.remove(+id);
    return ApiResponse.success('Student letter submission berhasil dihapus');
  }
}
