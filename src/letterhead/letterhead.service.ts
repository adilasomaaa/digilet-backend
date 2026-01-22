import {
  ConflictException,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { CreateLetterheadDto } from './dto/create-letterhead.dto';
import { UpdateLetterheadDto } from './dto/update-letterhead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLetterheadDto } from './dto/query-letterhead.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class LetterheadService {
  constructor(private prismaService: PrismaService) {}

  async create(
    createDto: CreateLetterheadDto,
    logo: Express.Multer.File,
    user: any,
  ) {
    if (logo) {
      const fullPath = logo.path;
      const cleanedPath = fullPath.replace('public/', '');
      createDto.logo = cleanedPath;
    } else {
      throw new ConflictException('Logo tidak ditemukan');
    }

    const userId = user.id;
    const institutionId = user.personnel.institutionId;

    return await this.prismaService.letterHead.create({
      data: {
        ...createDto,
        userId,
        institutionId,
      },
    });
  }

  async findAll(query: QueryLetterheadDto, user: any) {
    const { page = 1, limit = 10, search, institutionId } = query;

    const where: Prisma.LetterHeadWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (user.roles.name !== 'admin') {
      where.institutionId = user.personnel.institutionId;
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterHead.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          institution: true,
          user: true,
        },
        where,
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
        institution: true,
        user: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Kop Surat tidak ditemukan');
    }
    return data;
  }

  async update(
    id: number,
    updateDto: UpdateLetterheadDto,
    logo?: Express.Multer.File,
  ) {
    const data = await this.findOne(id);
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
