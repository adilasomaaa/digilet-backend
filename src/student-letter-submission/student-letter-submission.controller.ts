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
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { StudentLetterSubmissionService } from './student-letter-submission.service';
import { CreateStudentLetterSubmissionDto } from './dto/create-student-letter-submission.dto';
import { UpdateStudentLetterSubmissionDto } from './dto/update-student-letter-submission.dto';
import { VerifyStudentLetterSubmissionDto } from './dto/verify-student-letter-submission.dto';
import { ChangeStatusStudentLetterSubmissionDto } from './dto/change-status-student-letter-submission.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.services';
import { QueryStudentLetterSubmissionDto } from './dto/query-student-letter-submission.dto';
import type { Response, Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('api/student-letter-submission')
export class StudentLetterSubmissionController {
  constructor(
    private readonly studentLetterSubmissionService: StudentLetterSubmissionService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FilesInterceptor(
      'documents',
      10,
      new FileUploadService().getDynamicFileUploadOptions(
        'student-letter-submission',
        [
          'pdf',
          'jpg',
          'jpeg',
          'png',
          'gif',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'txt',
        ],
      ),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        letterId: {
          type: 'number',
          description: 'ID dari letter',
        },
        letterNumber: {
          type: 'string',
          description: 'Nomor surat (opsional)',
        },
        signatureType: {
          type: 'string',
          enum: ['barcode', 'digital'],
          description: 'jenis tanda tangan',
        },
        attributes: {
          type: 'string',
          description:
            'Daftar jawaban untuk atribut kustom dalam format JSON string',
        },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Daftar dokumen untuk upload',
        },
      },
      required: ['letterId', 'signatureType'],
    },
  })
  async create(
    @Body() createDto: CreateStudentLetterSubmissionDto,
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Parse attributes if it's a string (from form-data)
    if (typeof createDto.attributes === 'string') {
      try {
        createDto.attributes = JSON.parse(createDto.attributes);
      } catch {
        throw new BadRequestException('Format attributes tidak valid');
      }
    }

    // Parse documents if it's a string (from form-data)
    if (typeof createDto.documents === 'string') {
      try {
        createDto.documents = JSON.parse(createDto.documents);
      } catch {
        throw new BadRequestException('Format documents tidak valid');
      }
    }

    await this.studentLetterSubmissionService.create(
      createDto,
      req.user,
      files,
    );
    return ApiResponse.success('Student letter submission berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(
    @Query() query: QueryStudentLetterSubmissionDto,
    @Req() req: any,
  ) {
    const result = await this.studentLetterSubmissionService.findAll(
      query,
      req.user,
    );
    return ApiResponse.successWithPaginate(
      'Student letter submission berhasil diambil',
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
    const html = await this.studentLetterSubmissionService.printLetter(
      +id,
      baseUrl,
    );
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  @Get('print-pdf/:token')
  @Public()
  async printPdf(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pdfBuffer = await this.studentLetterSubmissionService.printLetterPdf(
      token,
      baseUrl,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="surat-${token}.pdf"`);
    return res.send(pdfBuffer);
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
  @UseInterceptors(
    FilesInterceptor(
      'documents',
      10,
      new FileUploadService().getDynamicFileUploadOptions(
        'student-letter-submission',
        [
          'pdf',
          'jpg',
          'jpeg',
          'png',
          'gif',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'txt',
        ],
      ),
    ),
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentLetterSubmissionDto,
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (typeof updateDto.attributes === 'string') {
      try {
        updateDto.attributes = JSON.parse(updateDto.attributes);
      } catch {
        throw new BadRequestException('Format attributes tidak valid');
      }
    }

    if (typeof updateDto.documents === 'string') {
      try {
        updateDto.documents = JSON.parse(updateDto.documents);
      } catch {
        throw new BadRequestException('Format documents tidak valid');
      }
    }

    await this.studentLetterSubmissionService.update(
      +id,
      updateDto,
      req.user,
      files,
    );
    return ApiResponse.success('Student letter submission berhasil diubah');
  }

  @Patch(':id/verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async verify(
    @Param('id') id: string,
    @Body() verifyDto: VerifyStudentLetterSubmissionDto,
    @Req() req: any,
  ) {
    if (typeof verifyDto.attributes === 'string') {
      try {
        verifyDto.attributes = JSON.parse(verifyDto.attributes);
      } catch {
        throw new BadRequestException('Format attributes tidak valid');
      }
    }

    await this.studentLetterSubmissionService.verify(+id, verifyDto, req.user);
    return ApiResponse.success(
      'Student letter submission berhasil diverifikasi',
    );
  }

  @Patch(':id/change-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusStudentLetterSubmissionDto,
    @Req() req: any,
  ) {
    await this.studentLetterSubmissionService.changeStatus(
      +id,
      changeStatusDto,
      req.user,
    );
    return ApiResponse.success(
      'Status student letter submission berhasil diubah',
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.studentLetterSubmissionService.remove(+id);
    return ApiResponse.success('Student letter submission berhasil dihapus');
  }
}
