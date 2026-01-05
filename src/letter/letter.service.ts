import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterDto } from './dto/query-letter.dto';
import { Prisma } from '@prisma/client';

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
    const { page, limit, search, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LetterWhereInput = {};

    if (search) {
      where.OR = [{ letterName: { contains: search } }];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (query.programStudyId) {
      where.user = {
        is: {
          personnels: {
            some: {
              studyProgramId: query.programStudyId,
            },
          },
        },
      };
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letter.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        where,
        include: {
          user: {
            include: {
              personnels: {
                include: {
                  studyProgram: true,
                },
              },
            },
          },
        },
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
      include: {
        user: {
          include: {
            personnels: {
              include: {
                studyProgram: true,
              },
            },
          },
        },
      },
    });
    if (!data) {
      throw new NotFoundException('Letter tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterDto) {
    await this.findOne(id);
    return await this.prismaService.letter.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letter.delete({
      where: { id },
    });
  }
}
