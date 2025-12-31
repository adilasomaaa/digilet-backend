import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficialDto } from './dto/create-official.dto';
import { UpdateOfficialDto } from './dto/update-official.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryOfficialDto } from './dto/query-official.dto';

@Injectable()
export class OfficialService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateOfficialDto) {
    return await this.prismaService.official.create({
      data: createDto,
    });
  }

  async findAll(query: QueryOfficialDto) {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.official.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.official.count(),
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
    const data = await this.prismaService.official.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Pegawai tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateOfficialDto) {
    return await this.prismaService.official.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    return await this.prismaService.official.delete({
      where: { id },
    });
  }
}