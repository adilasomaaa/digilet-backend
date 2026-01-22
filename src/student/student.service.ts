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
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

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
            email: nim,
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
            institutionId: createDto.institutionId,
            classYear: createDto.classYear,
            address: createDto.address,
            phoneNumber: createDto.phoneNumber,
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
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { fullname: { contains: search } },
        { institution: { name: { contains: search } } },
        { nim: { contains: search } },
      ];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.student.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          institution: true,
          user: true,
        },
        where,
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
            institutionId: updateDto.institutionId,
            classYear: updateDto.classYear,
            address: updateDto.address,
            phoneNumber: updateDto.phoneNumber,
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
    const student = this.findOne(id);
    return await this.prismaService.user.delete({
      where: { id: (await student).userId },
    });
  }

  async exportToExcel() {
    const students = await this.prismaService.student.findMany({
      include: { institution: true, user: true },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Full Name', key: 'fullname', width: 30 },
      { header: 'NIM', key: 'nim', width: 20 },
      { header: 'Study Program', key: 'institution', width: 25 },
      { header: 'Class Year', key: 'classYear', width: 10 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Phone Number', key: 'phoneNumber', width: 20 },
      { header: 'Birthday', key: 'birthday', width: 15 },
      { header: 'Birthplace', key: 'birthplace', width: 20 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Email', key: 'email', width: 25 },
    ];

    students.forEach((student) => {
      worksheet.addRow({
        id: student.id,
        fullname: student.fullname,
        nim: student.nim,
        institution: student.institution?.name || '',
        classYear: student.classYear,
        address: student.address,
        phoneNumber: student.phoneNumber,
        birthday: student.birthday
          ? new Date(student.birthday).toISOString().split('T')[0]
          : '',
        birthplace: student.birthplace,
        gender: student.gender,
        email: student.user?.email || '',
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
      let createdStudentsCount = 0;

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const nim = row.getCell(2).value?.toString();
        const email = row.getCell(9).value?.toString();

        if (!nim) continue;

        if (!email) {
          throw new BadRequestException(
            `Baris ${i}: Mahasiswa dengan NIM ${nim} wajib memiliki email karena akun User diperlukan.`,
          );
        }

        await tx.student.upsert({
          where: { nim: nim },
          update: {
            fullname: row.getCell(1).value?.toString() || '',
            classYear: row.getCell(3).value?.toString() || '',
            address: row.getCell(4).value?.toString() || '',
            phoneNumber: row.getCell(5).value?.toString(),
            birthday: row.getCell(6).value
              ? new Date(row.getCell(6).value?.toString() || '')
              : null,
            birthplace: row.getCell(7).value?.toString(),
            gender: row.getCell(8).value?.toString() || 'Not Specified',
            institution: { connect: { id: institutionId } },
          },
          create: {
            fullname: row.getCell(1).value?.toString() || '',
            nim: nim,
            classYear: row.getCell(3).value?.toString() || '',
            address: row.getCell(4).value?.toString() || '',
            phoneNumber: row.getCell(5).value?.toString(),
            birthday: row.getCell(6).value
              ? new Date(row.getCell(6).value?.toString() || '')
              : null,
            birthplace: row.getCell(7).value?.toString(),
            gender: row.getCell(8).value?.toString() || 'Not Specified',
            institution: { connect: { id: institutionId } },
            user: {
              connectOrCreate: {
                where: { email: email },
                create: {
                  email: nim,
                  name: row.getCell(1).value?.toString() || '',
                  password: await this.hashPassword(nim),
                  userRoles: {
                    create: {
                      role: { connect: { name: 'student' } },
                    },
                  },
                },
              },
            },
          },
        });

        createdStudentsCount++;
      }

      return {
        message: 'Import berhasil diselesaikan',
        total: createdStudentsCount,
      };
    });
  }
}
