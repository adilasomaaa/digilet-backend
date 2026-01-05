import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentSubmissionDto } from './dto/create-document-submission.dto';
import { UpdateDocumentSubmissionDto } from './dto/update-document-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryDocumentSubmissionDto } from './dto/query-document-submission.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class DocumentSubmissionService {
  constructor(private prismaService: PrismaService) {}

  async create(
    createDto: CreateDocumentSubmissionDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('File gambar harus diunggah');
    }

    const fullPath = file.path;
    const cleanedPath = fullPath.replace('public/', '');

    return await this.prismaService.documentSubmission.create({
      data: {
        ...createDto,
        filePath: cleanedPath,
      },
    });
  }

  async findAll(query: QueryDocumentSubmissionDto) {
    const { page, limit, search } = query;

    const where: Prisma.DocumentSubmissionWhereInput = {};

    if (search) {
      where.OR = [
        { filePath: { contains: search } },
        {
          studentLetterSubmission: {
            student: { fullname: { contains: search } },
          },
        },
        {
          letterDocument: { documentName: { contains: search } },
        },
      ];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.documentSubmission.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        where,
        include: {
          studentLetterSubmission: {
            include: {
              student: true,
            },
          },
          letterDocument: true,
        },
      }),
      this.prismaService.documentSubmission.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalData: total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.documentSubmission.findUnique({
      where: { id },
      include: {
        studentLetterSubmission: {
          include: {
            student: true,
          },
        },
        letterDocument: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Document submission tidak ditemukan');
    }
    return data;
  }

  async update(
    id: number,
    updateDto: UpdateDocumentSubmissionDto,
    file?: Express.Multer.File,
  ) {
    let data = await this.findOne(id);

    const updateData: any = { ...updateDto };

    if (file) {
      const fullPath = file.path;
      const cleanedPath = fullPath.replace('public/', '');
      updateData.filePath = cleanedPath;

      // Delete old file
      const oldFilePath = data.filePath;
      if (
        oldFilePath &&
        fs.existsSync(join(process.cwd(), 'public', oldFilePath))
      ) {
        try {
          fs.unlinkSync(join(process.cwd(), 'public', oldFilePath));
          console.log(`Successfully deleted old file: ${oldFilePath}`);
        } catch (err) {
          console.error(`Failed to delete old file: ${oldFilePath}`, err);
        }
      }
    }

    return await this.prismaService.documentSubmission.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const data = await this.findOne(id);

    // Delete file
    const filePath = data.filePath;
    if (filePath && fs.existsSync(join(process.cwd(), 'public', filePath))) {
      try {
        fs.unlinkSync(join(process.cwd(), 'public', filePath));
        console.log(`Successfully deleted file: ${filePath}`);
      } catch (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      }
    }

    return await this.prismaService.documentSubmission.delete({
      where: { id },
    });
  }
}
