import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterAttachmentDto } from './dto/create-letter-attachment.dto';
import { UpdateLetterAttachmentDto } from './dto/update-letter-attachment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterAttachmentDto } from './dto/query-letter-attachment.dto';
import { Prisma } from '@prisma/client';


@Injectable()
export class LetterAttachmentService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterAttachmentDto) {
    return await this.prismaService.letterAttachment.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterAttachmentDto) {
    const { page , limit, generalLetterSubmissionId, studentLetterSubmissionId } = query;

    const where: Prisma.LetterAttachmentWhereInput = {};

    if (generalLetterSubmissionId) {
      where.generalLetterSubmissionId = generalLetterSubmissionId;
    }

    if (studentLetterSubmissionId) {
      where.studentLetterSubmissionId = studentLetterSubmissionId;
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterAttachment.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.letterAttachment.count(),
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

  async upsert(createDto: CreateLetterAttachmentDto) {
      const existingData = await this.prismaService.letterAttachment.findFirst({
      where: {
        OR: [
          { generalLetterSubmissionId: createDto.generalLetterSubmissionId || undefined },
          { studentLetterSubmissionId: createDto.studentLetterSubmissionId || undefined },
        ],
      },
    });
      if (!existingData) {
        await this.prismaService.letterAttachment.create({
          data: createDto,
        });
  
        return 'Berhasil membuat template surat';
      }
      await this.prismaService.letterAttachment.update({
        where: { id: existingData.id },
        data: createDto,
      });
  
      return 'Berhasil memperbarui template surat';
    }

  async findOne(id: number) {
    const data = await this.prismaService.letterAttachment.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Letter-Attachment tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterAttachmentDto) {
    await this.findOne(id);
    return await this.prismaService.letterAttachment.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterAttachment.delete({
      where: { id },
    });
  }
}