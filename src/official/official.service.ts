import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficialDto } from './dto/create-official.dto';
import { UpdateOfficialDto } from './dto/update-official.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOfficialDto } from './dto/query-official.dto';
import { Prisma } from '@prisma/client';
import { getAccessibleInstitutionIds } from 'src/common/helpers/institution-access.helper';
import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

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

  async exportToExcel(user: any) {
    const where: Prisma.OfficialWhereInput = {};

    // Apply hierarchical institution filtering for personnel
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

    const officials = await this.prismaService.official.findMany({
      where,
      include: { institution: true },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Officials');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nama Lengkap', key: 'name', width: 30 },
      { header: 'NIP', key: 'nip', width: 20 },
      { header: 'Jabatan', key: 'occupation', width: 25 },
      { header: 'Institusi', key: 'institution', width: 25 },
    ];

    officials.forEach((officials) => {
      worksheet.addRow({
        id: officials.id,
        name: officials.name,
        nip: officials.nip,
        occupation: officials.occupation,
        institution: officials.institution?.name || '',
      });
    });

    worksheet.getRow(1).font = { bold: true };

    return await workbook.xlsx.writeBuffer();
  }

  async importFromExcel(fileBuffer: Buffer, institutionId: number) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    const worksheet = workbook.getWorksheet(1);

    if (institutionId === undefined) {
      throw new BadRequestException('Program studi harus dipilih.');
    }

    if (!worksheet || worksheet.rowCount <= 1) {
      throw new BadRequestException(
        'File excel kosong atau hanya berisi header',
      );
    }

    return await this.prismaService.$transaction(async (tx) => {
      let createdOfficialCount = 0;

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const nip = row.getCell(2).value?.toString();

        if (!nip) continue;

        await tx.official.create({
          data: {
            name: row.getCell(1).value?.toString() || '',
            nip: nip,
            occupation: row.getCell(3).value?.toString() || '',
            institution: { connect: { id: institutionId } },
          }
        });

        createdOfficialCount++;
      }

      return {
        message: 'Import berhasil diselesaikan',
        total: createdOfficialCount,
      };
    });
  }
}
