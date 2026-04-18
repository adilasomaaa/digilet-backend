import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStudentDto } from './dto/query-student.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import {
  getAccessibleInstitutionIds,
  hasWritePermission,
} from '../common/helpers/institution-access.helper';

@Injectable()
export class StudentService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createDto: CreateStudentDto, user?: any) {
    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk membuat student.',
        );
      }

      // Check if personnel has write permission
      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menambah data mahasiswa.',
        );
      }

      // Check if target institution is accessible
      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (
        accessibleIds &&
        !accessibleIds.includes(createDto.institutionId)
      ) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke institution tersebut.',
        );
      }
    }

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
    const [createdUser, student] = await this.prismaService.$transaction(
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

  async findAll(query: QueryStudentDto, user: any) {
    const { page = 1, limit = 10, search } = query;

    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { fullname: { contains: search } },
        { institution: { name: { contains: search } } },
        { nim: { contains: search } },
      ];
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
      this.prismaService.student.count({ where }),
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

  async update(id: number, updateDto: UpdateStudentDto, user?: any) {
    const student = await this.prismaService.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student tidak ditemukan');
    }

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk mengubah student.',
        );
      }

      // Check if personnel has write permission
      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk mengubah data mahasiswa.',
        );
      }

      // Check if current and target institutions are accessible
      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (accessibleIds) {
        if (!accessibleIds.includes(student.institutionId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke mahasiswa ini.',
          );
        }
        if (updateDto.institutionId && !accessibleIds.includes(updateDto.institutionId)) {
          throw new ForbiddenException(
            'Anda tidak memiliki akses ke institution tujuan.',
          );
        }
      }
    }

    const { email, nim } = updateDto;

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

    const [updatedUser, updatedStudent] = await this.prismaService.$transaction(
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

  async remove(id: number, user?: any) {
    const student = await this.findOne(id);

    // Check write permission for personnel
    if (user?.personnel) {
      const personnel = await this.prismaService.personnel.findUnique({
        where: { id: user.personnel.id },
        include: { institution: true },
      });

      if (!personnel?.institution) {
        throw new ForbiddenException(
          'Personnel harus memiliki institution untuk menghapus student.',
        );
      }

      // Check if personnel has write permission
      if (!hasWritePermission(personnel.institution.type)) {
        throw new ForbiddenException(
          'Anda tidak memiliki izin untuk menghapus data mahasiswa.',
        );
      }

      // Check if student's institution is accessible
      const accessibleIds = await getAccessibleInstitutionIds(
        this.prismaService,
        personnel.institutionId!,
        personnel.institution.type,
      );

      if (accessibleIds && !accessibleIds.includes(student.institutionId)) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke mahasiswa ini.',
        );
      }
    }

    return await this.prismaService.user.delete({
      where: { id: student.userId },
    });
  }

  async exportToExcel(user: any) {
    const where: Prisma.StudentWhereInput = {};

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

    const students = await this.prismaService.student.findMany({
      where,
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
    let createdStudentsCount = 0;

    const getVal = (value: any): string => {
      if (!value) return '';

      // kalau richText
      if (value.richText) {
        return value.richText.map((rt: any) => rt.text).join('');
      }

      return String(value);
    };

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      
      const fullname = getVal(row.getCell(1)).toUpperCase();
      const nim = getVal(row.getCell(2));
      const classYear = getVal(row.getCell(3));
      const address = getVal(row.getCell(4));
      const phoneNumber = getVal(row.getCell(5));
      const rawBirthday = row.getCell(6).value;
      const birthplace = getVal(row.getCell(7));
      const gender = getVal(row.getCell(8));
      const emailExcel = getVal(row.getCell(9));

      if (!nim) continue;

      if (!emailExcel) {
        throw new BadRequestException(
          `Baris ${i}: Mahasiswa dengan NIM ${nim} wajib memiliki email karena akun User diperlukan.`,
        );
      }
      
      try{
        await this.prismaService.$transaction(async (tx) => {
          const hashedPassword = await this.hashPassword(nim);
          let birthdayDate: Date | null = null;
          if (rawBirthday instanceof Date) {
            birthdayDate = rawBirthday;
          } else if (typeof rawBirthday === 'string' && rawBirthday !== '-') {
            const parsed = new Date(rawBirthday);
            if (!isNaN(parsed.getTime())) birthdayDate = parsed;
          }
          await tx.student.upsert({
            where: { nim: nim },
            update: {
              fullname,
              classYear,
              address,
              phoneNumber,
              birthday: birthdayDate,
              birthplace,
              gender,
            },
            create: {
              fullname,
              nim,
              classYear,
              address,
              phoneNumber,
              birthday: birthdayDate,
              birthplace,
              gender,
              institution: { connect: { id: Number(institutionId) } },
              user: {
                connectOrCreate: {
                  where: { email: emailExcel },
                  create: {
                    email: emailExcel,
                    name: fullname,
                    password: hashedPassword,
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
          console.log("Mahasiswa berhasil diimpor ", fullname)
        })
      }catch(error){
        console.log("Gagal import:", row, error.message);
        throw new BadRequestException(
          `Baris ${i}: Mahasiswa dengan NIM ${nim} gagal diimpor. Error: ${error.message}`,
        );
      }
    }

      return {
        message: 'Import berhasil diselesaikan',
        total: createdStudentsCount,
      };
  }
}
