import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { CreateLetterheadDto } from './dto/create-letterhead.dto';
import { UpdateLetterheadDto } from './dto/update-letterhead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLetterheadDto } from './dto/query-letterhead.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';
import {
  getAccessibleInstitutionIds,
  hasWritePermission,
} from '../common/helpers/institution-access.helper';

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

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk membuat letterhead.',
        );
      }

      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menambah kop surat.',
        );
      }

      // Determine institutionId
      let targetInstitutionId: number;
      if (createDto.institutionId) {
        // Faculty operator selecting institution
        const accessibleIds = await getAccessibleInstitutionIds(
          this.prismaService,
          personnel.institutionId!,
          personnel.institution.type,
        );

        if (accessibleIds && !accessibleIds.includes(createDto.institutionId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke institution tersebut.',
          );
        }
        targetInstitutionId = createDto.institutionId;
      } else {
        // Study program operator - use own institution
        targetInstitutionId = personnel.institutionId!;
      }

      const userId = user.id;
      const { institutionId, ...rest } = createDto;
      return await this.prismaService.letterHead.create({
        data: {
          ...rest,
          userId,
          institutionId: targetInstitutionId,
        },
      });
    }

    // Admin or other roles
    const userId = user.id;
    const institutionId = createDto.institutionId || user.personnel?.institutionId;
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
      this.prismaService.letterHead.count({ where }),
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
    user?: any,
  ) {
    const data = await this.findOne(id);

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk mengubah letterhead.',
        );
      }

      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk mengubah kop surat.',
        );
      }

      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (accessibleIds) {
        if (!accessibleIds.includes(data.institutionId!)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke kop surat ini.',
          );
        }
        if (updateDto.institutionId && !accessibleIds.includes(updateDto.institutionId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke institution tujuan.',
          );
        }
      }
    }

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

  async remove(id: number, user?: any) {
    const letterhead = await this.findOne(id);

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk menghapus letterhead.',
        );
      }

      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menghapus kop surat.',
        );
      }

      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (accessibleIds && !accessibleIds.includes(letterhead.institutionId!)) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke kop surat ini.',
        );
      }
    }

    return await this.prismaService.letterHead.delete({
      where: { id },
    });
  }
}
