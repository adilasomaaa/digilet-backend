import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryPersonnelDto } from './dto/query-personnel.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class PersonnelService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}
  async create(createPersonnelDto: CreatePersonnelDto) {
    const { email, name } = createPersonnelDto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar.');
    }

    const defaultPassword =
      this.configService.get<string>('DEFAULT_PASSWORD') || 'umgo2025!';

    const hashedPassword = await this.hashPassword(defaultPassword);
    const [user, personnel] = await this.prismaService.$transaction(
      async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
          },
        });

        const rolePersonnel = await tx.role.findUnique({
          where: { name: 'personnel' },
        });

        await tx.userRoles.create({
          data: {
            userId: newUser.id,
            roleId: rolePersonnel?.id!,
          },
        });

        const newPersonnel = await tx.personnel.create({
          data: {
            name: createPersonnelDto.name,
            position: createPersonnelDto.position,
            studyProgramId: createPersonnelDto.studyProgramId ?? undefined,
            userId: newUser.id,
          },
        });

        return [newUser, newPersonnel];
      },
    );

    return personnel;
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async findAll(query: QueryPersonnelDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PersonnelWhereInput = {};

    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.personnel.findMany({
        include: { studyProgram: true, user: true },
        skip,
        where,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prismaService.personnel.count(),
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
    const data = await this.prismaService.personnel.findUnique({
      include: { studyProgram: true, user: true },
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('Personel tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updatePersonnelDto: UpdatePersonnelDto) {
    const { email, name } = updatePersonnelDto;

    const personnel = await this.prismaService.personnel.findUnique({
      where: { id: +id },
    });

    if (!personnel) {
      throw new BadRequestException('Personel tidak ditemukan');
    }

    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email: updatePersonnelDto.email,
        NOT: { id: personnel.userId },
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email telah digunakan oleh user lain');
    }

    const [user, updatedPersonnel] = await this.prismaService.$transaction(
      async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: personnel.userId },
          data: {
            email,
            name,
          },
        });

        const updatedPersonnel = await tx.personnel.update({
          where: { id: +id },
          data: {
            name: updatePersonnelDto.name,
            position: updatePersonnelDto.position,
            studyProgramId: updatePersonnelDto.studyProgramId ?? undefined,
          },
        });

        return [updatedUser, updatedPersonnel];
      },
    );

    return updatedPersonnel;
  }

  async remove(id: number) {
    const personnel = this.findOne(id);
    return await this.prismaService.user.delete({
      where: { id: (await personnel).userId },
    });
  }
}
