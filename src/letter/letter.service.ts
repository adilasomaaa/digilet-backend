import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterDto } from './dto/query-letter.dto';

@Injectable()
export class LetterService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterDto, userId: number) {
    return await this.prismaService.letter.create({
      data: {
        ...createDto,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(query: QueryLetterDto) {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letter.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.letter.count(),
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
    const data = await this.prismaService.letter.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Letter tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterDto) {
    return await this.prismaService.letter.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    return await this.prismaService.letter.delete({
      where: { id },
    });
  }
}
