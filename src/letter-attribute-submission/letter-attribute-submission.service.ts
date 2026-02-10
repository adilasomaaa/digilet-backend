import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLetterAttributeSubmissionDto } from './dto/create-letter-attribute-submission.dto';
import { UpdateLetterAttributeSubmissionDto } from './dto/update-letter-attribute-submission.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLetterAttributeSubmissionDto } from './dto/query-letter-attribute-submission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LetterAttributeSubmissionService {
  constructor(private prismaService: PrismaService) {}

  async create(createDto: CreateLetterAttributeSubmissionDto) {
    return await this.prismaService.letterAttributeSubmission.create({
      data: createDto,
    });
  }

  async findAll(query: QueryLetterAttributeSubmissionDto) {
    const {
      page,
      limit,
      search,
      letterAttributeId,
      studentLetterSubmissionId,
      generalLetterSubmissionId,
    } = query;

    const where: Prisma.LetterAttributeSubmissionWhereInput = {};

    if (search) {
      where.OR = [{ content: { contains: search } }];
    }

    if (letterAttributeId) where.letterAttributeId = letterAttributeId;
    if (studentLetterSubmissionId)
      where.studentLetterSubmissionId = studentLetterSubmissionId;
    if (generalLetterSubmissionId)
      where.generalLetterSubmissionId = generalLetterSubmissionId;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.letterAttributeSubmission.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.letterAttributeSubmission.count(),
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
    const data = await this.prismaService.letterAttributeSubmission.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException(
        'Letter-Attribute-Submission tidak ditemukan',
      );
    }
    return data;
  }

  async update(id: number, updateDto: UpdateLetterAttributeSubmissionDto) {
    await this.findOne(id);
    return await this.prismaService.letterAttributeSubmission.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.letterAttributeSubmission.delete({
      where: { id },
    });
  }
}
