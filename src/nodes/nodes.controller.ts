import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NodesService } from './nodes.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { RenameNodeDto } from './dto/rename-node.dto';
import { QueryNodesDto } from './dto/query-nodes.dto';
import { SaveLetterPdfDto } from './dto/save-letter-pdf.dto';
import { FileUploadService } from '../common/services/file-upload.services';
import { ApiResponse } from '../common/helpers/api-response.helper';

@ApiTags('nodes')
@Controller('api/nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all nodes in a folder' })
  async findAll(@Query() query: QueryNodesDto, @Req() req: any) {
    const result = await this.nodesService.findAll(query, req.user.id);
    return ApiResponse.successWithPaginate(
      'Nodes berhasil diambil',
      result.data,
      result.meta,
    );
  }

  @Get('trash')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all deleted nodes' })
  async findTrash(@Req() req: any) {
    const data = await this.nodesService.findTrash(req.user.id);
    return ApiResponse.successWithData('Trash berhasil diambil', data);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single node' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const data = await this.nodesService.findOne(id, req.user.id);
    return ApiResponse.successWithData('Node berhasil diambil', data);
  }

  @Get(':id/breadcrumbs')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get breadcrumb path for node' })
  async getBreadcrumbs(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const data = await this.nodesService.getBreadcrumbs(id, req.user.id);
    return ApiResponse.successWithData('Breadcrumbs berhasil diambil', data);
  }

  @Post('folder')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create folder' })
  async createFolder(@Body() dto: CreateFolderDto, @Req() req: any) {
    await this.nodesService.createFolder(dto, req.user.id);
    return ApiResponse.success('Folder berhasil dibuat');
  }

  @Post('file/image')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload image file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getImageUploadOptions('nodes/images'),
    ),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('parentId') parentId: string,
    @Req() req: any,
  ) {
    await this.nodesService.uploadFile(
      file,
      'image',
      parentId ? parseInt(parentId) : undefined,
      req.user.id,
    );
    return ApiResponse.success('Gambar berhasil diupload');
  }

  @Post('file/pdf')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload PDF file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getPdfUploadOptions('nodes/pdfs'),
    ),
  )
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('parentId') parentId: string,
    @Req() req: any,
  ) {
    await this.nodesService.uploadFile(
      file,
      'pdf',
      parentId ? parseInt(parentId) : undefined,
      req.user.id,
    );
    return ApiResponse.success('PDF berhasil diupload');
  }

  @Post('link')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create link/text file' })
  async createLink(@Body() dto: CreateLinkDto, @Req() req: any) {
    await this.nodesService.createLink(dto, req.user.id);
    return ApiResponse.success('Link berhasil dibuat');
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rename node' })
  async rename(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RenameNodeDto,
    @Req() req: any,
  ) {
    await this.nodesService.rename(id, dto, req.user.id);
    return ApiResponse.success('Node berhasil diubah namanya');
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete node' })
  async softDelete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.nodesService.softDelete(id, req.user.id);
    return ApiResponse.success('Node berhasil dihapus');
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore node from trash' })
  async restore(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.nodesService.restore(id, req.user.id);
    return ApiResponse.success('Node berhasil dipulihkan');
  }

  @Delete(':id/permanent')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Permanently delete node' })
  async permanentDelete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    await this.nodesService.permanentDelete(id, req.user.id);
    return ApiResponse.success('Node berhasil dihapus permanent');
  }

  @Delete('trash/clear')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clear all trash' })
  async clearTrash(@Req() req: any) {
    await this.nodesService.clearTrash(req.user.id);
    return ApiResponse.success('Tempat sampah berhasil dikosongkan');
  }

  @Post('save-letter-pdf')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Save letter PDF to archive' })
  async saveLetterPdf(@Body() dto: SaveLetterPdfDto, @Req() req: any) {
    await this.nodesService.saveLetterPdfToArchive(
      dto.pdfPath,
      dto.fileName,
      req.user.id,
      dto.parentId,
    );
    return ApiResponse.success('PDF berhasil disimpan ke arsip');
  }
}

