import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterAttributeDto } from './dto/create-letter-attribute.dto';
import { UpdateLetterAttributeDto } from './dto/update-letter-attribute.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLetterAttributeDto } from './dto/query-letter-attribute.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LetterAttributeService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterAttributeDto) {
    return await this.prismaService.letterAttribute.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterAttributeDto) {
    const { page, limit, search, isEditable, letterId } = query;

    const where: Prisma.LetterAttributeWhereInput = {};

    if (search) {
      where.OR = [{ attributeName: { contains: search } }];
    }

    if (letterId) where.letterId = letterId;
    if (isEditable) where.isEditable = isEditable;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterAttribute.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        include: { letter: true },
        where,
      }),
      this.prismaService.letterAttribute.count({ where }),
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
    const data = await this.prismaService.letterAttribute.findUnique({
      where: { id },
      include: { letter: true },
    });
    if (!data) {
      throw new NotFoundException('Letter-Attribute tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterAttributeDto) {
    await this.findOne(id);
    return await this.prismaService.letterAttribute.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterAttribute.delete({
      where: { id },
    });
  }
}
