import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryStudentDto } from './dto/query-student.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createDto: CreateStudentDto) {
    const { email, nim } = createDto;

    const existingStudent = await this.prismaService.student.findFirst({
      where: {
        nim,
      },
    });

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingStudent) {
      throw new BadRequestException(
        'Student dengan email atau NIM tersebut sudah terdaftar.',
      );
    }

    if (existingUser) {
      throw new BadRequestException(
        'User dengan email tersebut sudah terdaftar.',
      );
    }

    const birthdayValue = createDto.birthday
      ? new Date(createDto.birthday)
      : undefined;

    const defaultPassword =
      this.configService.get<string>('DEFAULT_PASSWORD') || 'umgo2025!';

    const hashedPassword = await this.hashPassword(defaultPassword);
    const [user, student] = await this.prismaService.$transaction(
      async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            name: createDto.fullname,
            password: hashedPassword,
          },
        });

        const roleStudent = await tx.role.findUnique({
          where: { name: 'student' },
        });

        await tx.userRoles.create({
          data: {
            userId: newUser.id,
            roleId: roleStudent?.id!,
          },
        });

        const newStudent = await tx.student.create({
          data: {
            fullname: createDto.fullname,
            nim: createDto.nim,
            studyProgramId: createDto.studyProgramId,
            class_year: createDto.class_year,
            address: createDto.address,
            phone_number: createDto.phone_number,
            birthday: birthdayValue,
            birthplace: createDto.birthplace,
            gender: createDto.gender,
            userId: newUser.id,
          },
        });

        return [newUser, newStudent];
      },
    );

    return student;
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async findAll(query: QueryStudentDto) {
    const { page = 1, limit = 10 } = query;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.student.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          studyProgram: true,
          user: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.student.count(),
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
    const data = await this.prismaService.student.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Student tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateStudentDto) {
    const { email, nim } = updateDto;

    const student = await this.prismaService.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student tidak ditemukan');
    }

    const existingStudent = await this.prismaService.student.findFirst({
      where: {
        nim,
        NOT: { id },
      },
    });

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: updateDto.email, NOT: { id: student.userId } },
    });

    if (existingStudent) {
      throw new BadRequestException(
        'Student dengan email atau NIM tersebut sudah terdaftar.',
      );
    }

    if (existingUser) {
      throw new BadRequestException(
        'User dengan email tersebut sudah terdaftar.',
      );
    }

    const birthdayValue = updateDto.birthday
      ? new Date(updateDto.birthday)
      : undefined;

    const [user, updatedStudent] = await this.prismaService.$transaction(
      async (tx) => {
        const newUser = await tx.user.update({
          where: { id: student.userId },
          data: {
            email,
            name: updateDto.fullname,
          },
        });

        const newStudent = await tx.student.update({
          where: { id },
          data: {
            fullname: updateDto.fullname,
            nim: updateDto.nim,
            studyProgramId: updateDto.studyProgramId,
            class_year: updateDto.class_year,
            address: updateDto.address,
            phone_number: updateDto.phone_number,
            birthday: birthdayValue,
            birthplace: updateDto.birthplace,
            gender: updateDto.gender,
          },
        });

        return [newUser, newStudent];
      },
    );

    return updatedStudent;
  }

  async remove(id: number) {
    return await this.prismaService.student.delete({
      where: { id },
    });
  }
}
