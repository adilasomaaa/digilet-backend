import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterSignatureDto } from './dto/create-letter-signature.dto';
import { UpdateLetterSignatureDto } from './dto/update-letter-signature.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLetterSignatureDto } from './dto/query-letter-signature.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class LetterSignatureService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterSignatureDto) {
    const token = randomUUID();
    const code = Math.floor(100000 + Math.random() * 900000)
      .toString()
      .slice(-6);
    return await this.prismaService.letterSignature.create({
      data: {
        ...createDto,
        token,
        code,
      },
    });
  }

  async findAll(query: QueryLetterSignatureDto) {
    const { page, limit, search, studentLetterSubmissionId, generalLetterSubmissionId } = query;

    const where: Prisma.LetterSignatureWhereInput = {};

    if (search) {
      where.OR = [{ signature: { contains: search } }];
    }

    if (studentLetterSubmissionId) {
      where.studentLetterSubmissionId = studentLetterSubmissionId;
    }

    if (generalLetterSubmissionId) {
      where.generalLetterSubmissionId = generalLetterSubmissionId;
    }


    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterSignature.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        where,
        include: {
          studentLetterSubmission: {
            include: {
              student: true,
              letter: true
            },
          },
          generalLetterSubmission: {
            include: {
              user: true,
              letter: true,
            },
          },
          official: true,
        },
      }),
      this.prismaService.letterSignature.count({ where }),
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

  async findByToken(token: string) {
    const data = await this.prismaService.letterSignature.findFirst({
      where: { token },
      include: {
        studentLetterSubmission: {
          include: {
            student: true,
            letterAttributeSubmissions: {
              include: {
                letterAttribute: true,
              },
            },
            letter:true,
          },
        },
        generalLetterSubmission: {
          include: {
            user: true,
            letter: true,
            letterAttributeSubmissions: {
              include: {
                letterAttribute: true,
              },
            },
          },
        },
        official: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Letter signature tidak ditemukan');
    }
    return data;
  }

  async findOne(id: number) {
    const data = await this.prismaService.letterSignature.findUnique({
      where: { id },
      include: {
        studentLetterSubmission: {
          include: {
            student: true,
            letter:true,
          },
        },
        generalLetterSubmission: {
          include: {
            user: true,
            letter: true,
            letterAttributeSubmissions: {
              include: {
                letterAttribute: true,
              },
            },
          },
        },
        official: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Letter signature tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterSignatureDto) {
    await this.findOne(id);
    return await this.prismaService.letterSignature.update({
      where: { id },
      data: updateDto,
    });
  }
  async reset(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterSignature.update({
      where: { id },
      data: {
        code: Math.floor(100000 + Math.random() * 900000)
          .toString()
          .slice(-6),
        signature: null,
        verifiedAt: null,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterSignature.delete({
      where: { id },
    });
  }
}
