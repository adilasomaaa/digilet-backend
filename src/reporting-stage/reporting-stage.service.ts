import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportingStageDto } from './dto/create-reporting-stage.dto';
import { UpdateReportingStageDto } from './dto/update-reporting-stage.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryReportingStageDto } from './dto/query-reporting-stage.dto';
import { Prisma } from '@prisma/client';


@Injectable()
export class ReportingStageService {
    constructor(private prismaService: PrismaService) {}

    async create(createDto: CreateReportingStageDto) {
        const lastStage = await this.prismaService.reportingStages.findFirst({
            where: { reportingPeriodeId: createDto.reportingPeriodeId },
            orderBy: { stageOrder: 'desc' },
        });

        const startDateValue = new Date(createDto.startDate);
        const endDateValue = new Date(createDto.endDate);

        const newStageOrder = lastStage ? lastStage.stageOrder + 1 : 1;

        return await this.prismaService.reportingStages.create({
            data: {
                ...createDto,
                startDate: startDateValue,
                endDate: endDateValue,
                stageOrder: newStageOrder,
            },
        });
    }

    async move(id: number, direction: 'UP' | 'DOWN') {
        const stage = await this.findOne(id);
        const { reportingPeriodeId, stageOrder } = stage;

        const targetOrder = direction === 'UP' ? stageOrder - 1 : stageOrder + 1;

        const swapStage = await this.prismaService.reportingStages.findFirst({
            where: {
                reportingPeriodeId,
                stageOrder: targetOrder,
            },
        });

        if (!swapStage) {
             return stage; // No stage to swap with, do nothing
        }

        return await this.prismaService.$transaction([
            this.prismaService.reportingStages.update({
                where: { id: stage.id },
                data: { stageOrder: targetOrder },
            }),
            this.prismaService.reportingStages.update({
                where: { id: swapStage.id },
                data: { stageOrder: stageOrder },
            }),
        ]);
    }

    async findAll(query: QueryReportingStageDto) {
        const { page , limit , search, reportingPeriodeId } = query;

        const where: Prisma.ReportingStagesWhereInput = {};

        if(!reportingPeriodeId){
            throw new BadRequestException('reportingPeriodeId is required');
        }
        where.reportingPeriodeId = reportingPeriodeId;

        if (search) {
            where.OR = [{ stageName: { contains: search } }];
        }

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.reportingStages.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'asc' },
                where,
            }),
            this.prismaService.reportingStages.count({
                where,
            }),
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
        const data = await this.prismaService.reportingStages.findUnique({
            where: { id },
            include: {
                reportingPeriode: {
                    include: {
                        institution: true,
                    },
                },
            },
        });
        if (!data) {
            throw new NotFoundException('Reporting-Stage tidak ditemukan');
        }
        return data;
    }

    async update(id: number, updateDto: UpdateReportingStageDto) {
        await this.findOne(id);
        
        const data: any = { ...updateDto };
        
        if (updateDto.startDate) {
            data.startDate = new Date(updateDto.startDate);
        }
        
        if (updateDto.endDate) {
            data.endDate = new Date(updateDto.endDate); 
        }

        return await this.prismaService.reportingStages.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.prismaService.reportingStages.delete({
            where: { id },
        });
    }
}