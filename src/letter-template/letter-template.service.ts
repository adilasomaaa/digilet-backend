import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterTemplateDto } from './dto/create-letter-template.dto';
import { UpdateLetterTemplateDto } from './dto/update-letter-template.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterTemplateDto } from './dto/query-letter-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LetterTemplateService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterTemplateDto) {
    return await this.prismaService.letterTemplate.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterTemplateDto) {
    const { letterId, page = 1, limit = 10 } = query;
    const where: Prisma.LetterTemplateWhereInput = {};
    if (letterId) where.letterId = letterId;
    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterTemplate.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where,
        orderBy: { createdAt: 'asc' },
        include: { letter: true },
      }),
      this.prismaService.letterTemplate.count({ where }),
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

  async upsert(createDto: CreateLetterTemplateDto) {
    const existingData = await this.prismaService.letterTemplate.findFirst({
      where: { letterId: createDto.letterId },
    });
    if (!existingData) {
      await this.prismaService.letterTemplate.create({
        data: createDto,
      });

      return 'Berhasil membuat template surat';
    }
    await this.prismaService.letterTemplate.update({
      where: { id: existingData.id },
      data: createDto,
    });

    return 'Berhasil memperbarui template surat';
  }

  async findOne(id: number) {
    const data = await this.prismaService.letterTemplate.findUnique({
      where: { id },
      include: { letter: true },
    });
    if (!data) throw new NotFoundException('LetterTemplate tidak ditemukan');
    return data;
  }

  async update(id: number, updateDto: UpdateLetterTemplateDto) {
    await this.findOne(id);
    return await this.prismaService.letterTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterTemplate.delete({ where: { id } });
  }
}
