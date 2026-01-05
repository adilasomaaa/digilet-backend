import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterDocumentDto } from './dto/create-letter-document.dto';
import { UpdateLetterDocumentDto } from './dto/update-letter-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterDocumentDto } from './dto/query-letter-document.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LetterDocumentService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterDocumentDto) {
    return await this.prismaService.letterDocument.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterDocumentDto) {
    const { letterId, page = 1, limit = 10 } = query;
    const where: Prisma.LetterDocumentWhereInput = {};
    if (letterId) where.letterId = letterId;
    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterDocument.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where,
        orderBy: { createdAt: 'asc' },
        include: { letter: true },
      }),
      this.prismaService.letterDocument.count({ where }),
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
    const data = await this.prismaService.letterDocument.findUnique({
      where: { id },
      include: { letter: true },
    });
    if (!data) throw new NotFoundException('LetterDocument tidak ditemukan');
    return data;
  }

  async update(id: number, updateDto: UpdateLetterDocumentDto) {
    await this.findOne(id);
    return await this.prismaService.letterDocument.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterDocument.delete({ where: { id } });
  }
}
