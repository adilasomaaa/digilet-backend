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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DocumentSubmissionService } from './document-submission.service';
import { CreateDocumentSubmissionDto } from './dto/create-document-submission.dto';
import { UpdateDocumentSubmissionDto } from './dto/update-document-submission.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/helpers/api-response.helper';
import { QueryDocumentSubmissionDto } from './dto/query-document-submission.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/services/file-upload.services';

@Controller('api/document-submission')
export class DocumentSubmissionController {
  constructor(
    private readonly documentSubmissionService: DocumentSubmissionService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getImageUploadOptions('document-submission'),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentLetterSubmissionId: {
          type: 'number',
        },
        letterDocumentId: {
          type: 'number',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(
    @Body() createDto: CreateDocumentSubmissionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.documentSubmissionService.create(createDto, file);
    return ApiResponse.success('Document submission berhasil dibuat');
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findAll(@Query() query: QueryDocumentSubmissionDto) {
    const result = await this.documentSubmissionService.findAll(query);
    return ApiResponse.successWithPaginate(
      'Document submission berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    const data = await this.documentSubmissionService.findOne(+id);
    return ApiResponse.successWithData(
      'Document submission berhasil diambil',
      data,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getImageUploadOptions('document-submission'),
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        studentLetterSubmissionId: {
          type: 'number',
        },
        letterDocumentId: {
          type: 'number',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentSubmissionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.documentSubmissionService.update(+id, updateDto, file);
    return ApiResponse.success('Document submission berhasil diubah');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  async remove(@Param('id') id: string) {
    await this.documentSubmissionService.remove(+id);
    return ApiResponse.success('Document submission berhasil dihapus');
  }
}
