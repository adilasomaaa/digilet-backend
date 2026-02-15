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
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { OfficialService } from './official.service';
import { CreateOfficialDto } from './dto/create-official.dto';
import { UpdateOfficialDto } from './dto/update-official.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryOfficialDto } from './dto/query-official.dto';
import * as express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/official')
export class OfficialController {
  constructor(private readonly officialService: OfficialService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(@Body() createDto: CreateOfficialDto) {
    await this.officialService.create(createDto);
    return ApiResponse.success('Official berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryOfficialDto, @Req() req: any) {
    const result = await this.officialService.findAll(query, req.user);
    return ApiResponse.successWithPaginate(
      'Official berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.officialService.findOne(+id);
    return ApiResponse.successWithData('Official berhasil diambil', data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(@Param('id') id: string, @Body() updateDto: UpdateOfficialDto) {
    await this.officialService.update(+id, updateDto);
    return ApiResponse.success('Official berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.officialService.remove(+id);
    return ApiResponse.success('Official berhasil dihapus');
  }

  @Get('export/excel')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async export(@Res() res: express.Response, @Req() req: any) {
    const buffer: any = await this.officialService.exportToExcel(req.user);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="data-dosen.xlsx"',
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

    const result = await this.officialService.importFromExcel(
      file.buffer,
      institutionId,
    );
    return ApiResponse.successWithData(
      `${result.total} Data pegawai berhasil diimpor`,
        result,
      );
    }
}
