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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryStudentDto } from './dto/query-student.dto';
import * as express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateStudentDto, @Req() req: any) {
    await this.studentService.create(createDto, req.user);
    return ApiResponse.success('Student berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryStudentDto, @Req() req: any) {
    const result = await this.studentService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Student berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.studentService.findOne(+id);
    return ApiResponse.successWithData('Student berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentDto,
    @Req() req: any,
  ) {
    await this.studentService.update(+id, updateDto, req.user);
    return ApiResponse.success('Student berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.studentService.remove(+id, req.user);
    return ApiResponse.success('Student berhasil dihapus');
  }

  @Get('export/excel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async export(@Res() res: express.Response) {
    const buffer: any = await this.studentService.exportToExcel();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="data-mahasiswa.xlsx"',
      'Content-Length': buffer.length,
    });

    return res.send(buffer);
  }

  @Post('import')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Query('institutionId', ParseIntPipe) institutionId: number,
  ) {
    if (!file) throw new BadRequestException('File excel harus diunggah');
    if (!institutionId) new BadRequestException('Program studi harus dipilih.');

    const result = await this.studentService.importFromExcel(
      file.buffer,
      institutionId,
    );
    return ApiResponse.successWithData(
      `${result.total} Data mahasiswa berhasil diimpor`,
      result,
    );
  }
}
