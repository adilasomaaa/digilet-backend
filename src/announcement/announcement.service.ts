import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAnnouncementDto } from './dto/query-announcement.dto';
import { Prisma, User } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';


@Injectable()
export class AnnouncementService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateAnnouncementDto, file: Express.Multer.File, user: any) {
    if (file) {
      const fullPath = file.path;
      const cleanedPath = fullPath.replace('public/', '');
      createDto.file = cleanedPath;
    }
    if(!user.personnel){
      throw new ConflictException('Pengumuman hanya dapat dibuat oleh operator');
    }
    const institutionId = user.personnel.institutionId;
    const userId = user.id
    return await this.prismaService.announcement.create({
      data: {...createDto, institutionId, userId},
    });
  }

  async findAll(query: QueryAnnouncementDto, user: any) {
    const { page , limit } = query;

    const where: Prisma.AnnouncementWhereInput = {};

    if (user.roles.name === 'personnel') {
      where.institutionId = user.personnel.institutionId;
    }

    if(user.roles.name === 'student') {
      where.institutionId = user.student.institutionId;
      where.status = true;
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.announcement.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          institution: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.announcement.count(),
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
    const data = await this.prismaService.announcement.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Announcement tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateAnnouncementDto, file?: Express.Multer.File) {
    const data = await this.findOne(id);
    if (file) {
      const fullPath = file.path;
      const cleanedPath = fullPath.replace('public/', '');
      updateDto.file = cleanedPath;
      const oldPhotoPath = data.file;
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
      if (data.file) {
        updateDto.file = data.file;
      }
    }
    return await this.prismaService.announcement.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.announcement.delete({
      where: { id },
    });
  }
}