import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHeaderDto } from './dto/create-header.dto';
import { UpdateHeaderDto } from './dto/update-header.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryHeaderDto } from './dto/query-header.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class HeaderService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateHeaderDto, logo: Express.Multer.File) {
    if (logo) {
      const fullPath = logo.path;
      const cleanedPath = fullPath.replace('public/', '');
      createDto.logo = cleanedPath;
    } else {
      throw new Error('Logo tidak ditemukan');
    }

    return await this.prismaService.header.create({
      data: createDto,
    });
  }

  async findAll(query: QueryHeaderDto) {
    const { page = 1, limit = 10, search, studyProgramId } = query;

    const where: Prisma.HeaderWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    if (studyProgramId) {
      where.studyProgramId = studyProgramId;
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.header.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          studyProgram: true,
        },
        where,
      }),
      this.prismaService.header.count(),
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
    const data = await this.prismaService.header.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Header tidak ditemukan');
    }
    return data;
  }

  async update(
    id: number,
    updateDto: UpdateHeaderDto,
    logo?: Express.Multer.File,
  ) {
    let data = await this.findOne(id);
    if (logo) {
      const fullPath = logo.path;
      const cleanedPath = fullPath.replace('public/', '');
      updateDto.logo = cleanedPath;
      const oldPhotoPath = data.logo;
      if (
        oldPhotoPath &&
        fs.existsSync(join(process.cwd(), 'public', oldPhotoPath))
      ) {
        try {
          fs.unlinkSync(join(process.cwd(), 'public', oldPhotoPath));
          console.log(`Successfully deleted old photo: ${oldPhotoPath}`);
        } catch (err) {
          console.error(`Failed to delete old photo: ${oldPhotoPath}`, err);
        }
      }
    } else {
      if (data.logo) {
        updateDto.logo = data.logo;
      }
    }
    return await this.prismaService.header.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.header.delete({
      where: { id },
    });
  }
}
