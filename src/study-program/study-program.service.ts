import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudyProgramDto } from './dto/create-study-program.dto';
import { UpdateStudyProgramDto } from './dto/update-study-program.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryStudyProgramDto } from './dto/query-study-program.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudyProgramService {
  constructor(private prismaService: PrismaService) {}
  async create(createStudyProgramDto: CreateStudyProgramDto) {
    const data = await this.prismaService.studyProgram.create({
      data: createStudyProgramDto,
    });
    return data;
  }

  async findAll(query: QueryStudyProgramDto) {
    const { page, limit, search } = query;

    const where: Prisma.StudyProgramWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.studyProgram.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.studyProgram.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        totalData: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const data = await this.prismaService.studyProgram.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateStudyProgramDto: UpdateStudyProgramDto) {
    return await this.prismaService.studyProgram.update({
      where: { id },
      data: updateStudyProgramDto,
    });
  }

  async remove(id: number) {
    return await this.prismaService.studyProgram.delete({
      where: { id },
    });
  }
}
