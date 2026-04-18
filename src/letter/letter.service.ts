import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLetterDto } from './dto/query-letter.dto';
import { Prisma, User } from '@prisma/client';
import {
  getAccessibleInstitutionIds,
  hasWritePermission,
} from '../common/helpers/institution-access.helper';

@Injectable()
export class LetterService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterDto, user: any) {
    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk membuat letter.',
        );
      }

      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menambah jenis surat.',
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

      const { letterHeadId, institutionId, ...rest } = createDto;
      const userId = user.id;
      return await this.prismaService.letter.create({
        data: {
          ...rest,
          userId,
          institutionId: targetInstitutionId,
          letterHeadId,
        },
      });
    }

    // Admin or other roles
    const { letterHeadId, ...rest } = createDto;
    const userId = user.id;
    const institutionId = createDto.institutionId || user.personnel?.institutionId;
    return await this.prismaService.letter.create({
      data: {
        ...createDto,
        userId,
        institutionId,
        letterHeadId,
      },
    });
  }

  async findAll(query: QueryLetterDto, user: any) {
    const { page, limit, search, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LetterWhereInput = {};

    if (search) {
      where.OR = [{ letterName: { contains: search } }];
    }

    if (category && category !== 'all') {
      where.category = category;
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

    if (user.roles.name === 'student') {
      where.category = 'study_program';
      where.status = 'public';
      where.institutionId = user.student.institutionId;
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
              personnel: true,
            },
          },
          institution: true,
          letterHead: true,
          letterAttributes: true,
        },
      }),
      this.prismaService.letter.count({ where }),
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
            personnel: true,
          },
        },
        institution: true,
        letterHead: true,
        letterAttributes: true,
        letterDocuments: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Letter tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterDto, user?: any) {
    const letter = await this.findOne(id);

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk mengubah letter.',
        );
      }

      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk mengubah jenis surat.',
        );
      }

      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (accessibleIds) {
        if (!accessibleIds.includes(letter.institutionId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke jenis surat ini.',
          );
        }
        if (updateDto.institutionId && !accessibleIds.includes(updateDto.institutionId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke institution tujuan.',
          );
        }
      }
    }

    return await this.prismaService.letter.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number, user?: any) {
    const letter = await this.findOne(id);

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk menghapus letter.',
        );
      }

      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menghapus jenis surat.',
        );
      }

      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (accessibleIds && !accessibleIds.includes(letter.institutionId)) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke jenis surat ini.',
        );
      }
    }

    return await this.prismaService.letter.delete({
      where: { id },
    });
  }
}
