import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfficialDto } from './dto/create-official.dto';
import { UpdateOfficialDto } from './dto/update-official.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOfficialDto } from './dto/query-official.dto';
import { Prisma, User } from '@prisma/client';
import { getAccessibleInstitutionIds } from 'src/common/helpers/institution-access.helper';
import * as ExcelJS from 'exceljs';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OfficialService {
  constructor(private prismaService: PrismaService) {}

  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async create(createDto: CreateOfficialDto) {
    const { email, name } = createDto;
    
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar.');
    }

    const defaultPassword = createDto.nip
    const hashedPassword = await this.hashPassword(defaultPassword);

    const [user, official] = await this.prismaService.$transaction(
      async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
          },
        });

        const roleLecturer = await tx.role.upsert({
          where: { name: 'lecturer' },
          update: {},
          create: { name: 'lecturer' },
        });

        await tx.userRoles.create({
          data: {
            userId: newUser.id,
            roleId: roleLecturer?.id!,
          },
        });

        const newOfficial = await tx.official.create({
          data: {
            name: createDto.name,
            nip: createDto.nip,
            occupation: createDto.occupation,
            institutionId: createDto.institutionId ?? undefined,
            userId: newUser.id,
          },
        });

        return [newUser, newOfficial];
      },
    );

    return official;
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
          user: true
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
      include: {
        institution: true,
        user: true
      }
    });
    if (!data) {
      throw new NotFoundException('Pegawai tidak ditemukan');
    }
    return data;
  }   

  async update(id: number, updateDto: UpdateOfficialDto) {
    const { email, name } = updateDto;

    const official = await this.findOne(id);


    const userWhere: Prisma.UserWhereInput = {
      email: updateDto.email,
    };

    if (official.userId) {
      userWhere.NOT = { id: official.userId };
    }

    const existingUser = await this.prismaService.user.findFirst({
      where: userWhere,
    });

    if (existingUser) {
      throw new BadRequestException('Email telah digunakan oleh user lain');
    }
    
    const [user, updatedOfficial] = await this.prismaService.$transaction(
      async (tx) => {
        let updatedUser: User | null = null;
        if (official.userId) {
          updatedUser = await tx.user.update({
            where: { id: official.userId },
            data: {
              email,
              name,
            },
          });
        }

        const updatedOfficial = await tx.official.update({
          where: { id: +id },
          data: {
            name: updateDto.name,
            nip: updateDto.nip,
            occupation: updateDto.occupation,
            institutionId: updateDto.institutionId ?? undefined,
          },
        });

        return [updatedUser, updatedOfficial];
      },
    );

    return updatedOfficial;
  }

  async remove(id: number) {
    const official = await this.findOne(id);

    if (official.userId) {
      return await this.prismaService.user.delete({
        where: { id: official.userId },
      });
    }

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
      include: { institution: true, user: true },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Officials');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nama Lengkap', key: 'name', width: 30 },
      { header: 'NIP', key: 'nip', width: 20 },
      { header: 'Jabatan', key: 'occupation', width: 25 },
      { header: 'Institusi', key: 'institution', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
    ];

    officials.forEach((officials) => {
      worksheet.addRow({
        id: officials.id,
        name: officials.name,
        nip: officials.nip,
        occupation: officials.occupation,
        institution: officials.institution?.name || '',
        email: officials.user?.email || '',
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
        const name = row.getCell(2).value?.toString();
        const nip = row.getCell(3).value?.toString();
        const occupation = row.getCell(4).value?.toString() || '';
        const email = row.getCell(5).value?.toString();

        if (!nip || !email || !name) continue;

        const hashedPassword = await this.hashPassword(nip);

        const userData = {
          email,
          name: name || '',
          password: hashedPassword,
        };

        const existingUser = await tx.user.findUnique({ where: { email } });
        let userId: number;

        if (existingUser) {
          userId = existingUser.id;
          await tx.user.update({
            where: { id: userId },
            data: { name: name || undefined },
          });
        } else {
          const newUser = await tx.user.create({
            data: {
              ...userData,
              userRoles: {
                create: {
                  role: {
                    connectOrCreate: {
                      where: { name: 'lecturer' },
                      create: { name: 'lecturer' },
                    },
                  },
                },
              },
            },
          });
          userId = newUser.id;
        }

        // Upsert official linked to the user
        await tx.official.upsert({
          where: { nip },
          create: {
            name: name || '',
            nip,
            occupation,
            institution: { connect: { id: institutionId } },
            user: { connect: { id: userId } },
          },
          update: {
            name: name || undefined,
            occupation: occupation || undefined,
            institution: { connect: { id: institutionId } },
            user: { connect: { id: userId } },
          },
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
