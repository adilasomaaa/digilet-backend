import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficialDto } from './dto/create-official.dto';
import { UpdateOfficialDto } from './dto/update-official.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOfficialDto } from './dto/query-official.dto';
import { Prisma } from '@prisma/client';
import { getAccessibleInstitutionIds } from 'src/common/helpers/institution-access.helper';

@Injectable()
export class OfficialService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateOfficialDto) {
    return await this.prismaService.official.create({
      data: createDto,
    });
  }

  async findAll(query: QueryOfficialDto, user: any) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.OfficialWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (personnel?.institution) {
        const accessibleIds = await getAccessibleInstitutionIds(
          this.prismaService,
          personnel.institutionId!,
          personnel.institution.type,
        );

        if (accessibleIds !== null) {
          where.institutionId = { in: accessibleIds };
        }
      }
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.official.findMany({
        include: {
          institution: true,
        },
        where,
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
