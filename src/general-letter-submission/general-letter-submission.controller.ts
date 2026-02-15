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
import { GeneralLetterSubmissionService } from './general-letter-submission.service';
import { CreateGeneralLetterSubmissionDto } from './dto/create-general-letter-submission.dto';
import { UpdateGeneralLetterSubmissionDto } from './dto/update-general-letter-submission.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../common/helpers/api-response.helper';
import { QueryGeneralLetterSubmissionDto } from './dto/query-general-letter-submission.dto';
import type { Response, Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/general-letter-submission')
export class GeneralLetterSubmissionController {
  constructor(
    private readonly generalLetterSubmissionService: GeneralLetterSubmissionService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createDto: CreateGeneralLetterSubmissionDto,
    @Req() req: any,
  ) {
    await this.generalLetterSubmissionService.create(createDto, req.user);
    return ApiResponse.success('General letter submission berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(
    @Query() query: QueryGeneralLetterSubmissionDto,
    @Req() req: any,
  ) {
    const result = await this.generalLetterSubmissionService.findAll(
      query,
      req.user,
    );
    return ApiResponse.successWithPaginate(
      'General letter submission berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id/print')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async print(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const html = await this.generalLetterSubmissionService.printLetter(
      +id,
      baseUrl,
    );
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }



  @Get('letter-data/:token')
  @Public()
  async getLetterData(
    @Param('token') token: string,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const data = await this.generalLetterSubmissionService.getLetterData(
      token,
      baseUrl,
    );
    return ApiResponse.successWithData(
      'Letter data berhasil diambil',
      data,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.generalLetterSubmissionService.findOne(+id);
    return ApiResponse.successWithData(
      'General letter submission berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGeneralLetterSubmissionDto,
  ) {
    await this.generalLetterSubmissionService.update(+id, updateDto);
    return ApiResponse.success('General letter submission berhasil diubah');
  }
  
  @Patch(':id/carbon-copy')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async updateCarbonCopy(
    @Param('id') id: string,
    @Body() updateDto: UpdateGeneralLetterSubmissionDto,
  ) {
    await this.generalLetterSubmissionService.updateCarbonCopy(+id, updateDto);
    return ApiResponse.success('Tembusan berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.generalLetterSubmissionService.remove(+id);
    return ApiResponse.success('General letter submission berhasil dihapus');
  }
}
