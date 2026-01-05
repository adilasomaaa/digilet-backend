import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterheadDto } from './dto/create-letterhead.dto';
import { UpdateLetterheadDto } from './dto/update-letterhead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterheadDto } from './dto/query-letterhead.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LetterheadService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterheadDto) {
    return await this.prismaService.letterHead.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterheadDto) {
    const { page, limit, search, letterId, headerId } = query;

    const where: Prisma.LetterHeadWhereInput = {};
    if (letterId) where.letterId = letterId;
    if (headerId) where.headerId = headerId;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterHead.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        where,
        include: {
          letter: true,
          header: true,
        },
      }),
      this.prismaService.letterHead.count(),
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
    const data = await this.prismaService.letterHead.findUnique({
      where: { id },
      include: {
        letter: true,
        header: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Letterhead tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterheadDto) {
    await this.findOne(id);
    return await this.prismaService.letterHead.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterHead.delete({
      where: { id },
    });
  }
}
