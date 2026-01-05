import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterSignatureTemplateDto } from './dto/create-letter-signature-template.dto';
import { UpdateLetterSignatureTemplateDto } from './dto/update-letter-signature-template.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterSignatureTemplateDto } from './dto/query-letter-signature-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LetterSignatureTemplateService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterSignatureTemplateDto) {
    return await this.prismaService.letterSignatureTemplate.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterSignatureTemplateDto) {
    const { letterId, officialId, page = 1, limit = 10 } = query;
    const where: Prisma.LetterSignatureTemplateWhereInput = {};
    if (letterId) where.letterId = letterId;
    if (officialId) where.officialId = officialId;
    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterSignatureTemplate.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.letterSignatureTemplate.count({ where }),
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
    const data = await this.prismaService.letterSignatureTemplate.findUnique({
      where: { id },
    });
    if (!data)
      throw new NotFoundException('LetterSignatureTemplate tidak ditemukan');
    return data;
  }

  async update(id: number, updateDto: UpdateLetterSignatureTemplateDto) {
    await this.findOne(id);
    return await this.prismaService.letterSignatureTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterSignatureTemplate.delete({
      where: { id },
    });
  }
}
