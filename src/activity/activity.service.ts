import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryActivityDto } from './dto/query-activity.dto';
import { AttendActivityDto } from './dto/attend-activity.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';


@Injectable()
export class ActivityService {
    constructor(private prismaService: PrismaService) {}

    async create(createDto: CreateActivityDto, req: any) {
        const uniqueCode = randomUUID();
        const user = req.user
        return await this.prismaService.activity.create({
            data: {
                ...createDto,
                uniqueCode,
                userId: user.id,
                implementationDate: new Date(createDto.implementationDate),
            }
        });
    }

    async findAll(query: QueryActivityDto) {
        const { page , limit , search } = query;

        const where: Prisma.ActivityWhereInput = {};

        if (search) {
            where.OR = [{ activityName: { contains: search } }];
        }

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.activity.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'asc' },
            }),
            this.prismaService.activity.count(),
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
        const data = await this.prismaService.activity.findUnique({
            where: { id },
        });
        if (!data) {
            throw new NotFoundException('Activity tidak ditemukan');
        }
        return data;
    }

    async update(id: number, updateDto: UpdateActivityDto) {
        await this.findOne(id);
        const data: any = { ...updateDto };
        
        if (updateDto.implementationDate) {
            data.implementationDate = new Date(updateDto.implementationDate);
        }
        return await this.prismaService.activity.update({
            where: { id },
            data: data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.prismaService.activity.delete({
            where: { id },
        });
    }

    async findByCode(uniqueCode: string) {
        const activity = await this.prismaService.activity.findFirst({
            where: { uniqueCode },
            include: { activityParticipants: { include: { user: { include: { student: true, official: true } } } } }
        });
        if (!activity) {
            throw new NotFoundException('Activity tidak ditemukan');
        }
        return activity;
    }
}