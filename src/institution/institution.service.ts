import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { QueryInstitutionDto } from './dto/query-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionService {
  constructor(private prismaService: PrismaService) {}
  async create(createInstitutionDto: CreateInstitutionDto) {
    const data = await this.prismaService.institution.create({
      data: createInstitutionDto,
    });
    return data;
  }

  async findAll(query: QueryInstitutionDto) {
    const { page, limit, search } = query;

    const where: Prisma.InstitutionWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.institution.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.institution.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.institution.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Lembaga tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateInstitutionDto: UpdateInstitutionDto) {
    return await this.prismaService.institution.update({
      where: { id },
      data: updateInstitutionDto,
    });
  }

  async remove(id: number) {
    return await this.prismaService.institution.delete({
      where: { id },
    });
  }
}
