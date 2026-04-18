import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateLecturerReportDto } from './dto/create-lecturer-report.dto';
import { UpdateLecturerReportDto } from './dto/update-lecturer-report.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLecturerReportDto } from './dto/query-lecturer-report.dto';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class LecturerReportService {
    constructor(private prismaService: PrismaService) {}

    async create(createDto: CreateLecturerReportDto, file: Express.Multer.File, user: any) {
        if (file) {
            const fullPath = file.path;
            const cleanedPath = fullPath.replace('public/', '');
            createDto.documentProved = cleanedPath;
        }

        if (!user.official) {
            throw new NotFoundException('Dosen/Pegawai tidak ditemukan');
        }

        const stage = await this.prismaService.reportingStages.findUnique({
            where: { id: Number(createDto.reportingStageId) }
        });

        if (!stage) {
            throw new NotFoundException('Tahapan pelaporan tidak ditemukan');
        }

        const now = new Date();
        if (now < stage.startDate || now > stage.endDate) {
            throw new BadRequestException('Laporan tidak dapat dibuat di luar jadwal tahapan ini');
        }

        // Validate validatorId is valid Official
        const validator = await this.prismaService.official.findUnique({
            where: { id: Number(createDto.validatorId) }
        });

        if (!validator) {
            throw new NotFoundException('Validator tidak ditemukan');
        }

        const reporterId = user.official.id;

        return await this.prismaService.lecturerReport.create({
            data: {
                reporterId,
                ...createDto,
                validatorId: Number(createDto.validatorId),
                reportingStageId: Number(createDto.reportingStageId)
            },
        });
    }

    private buildWhere(query: QueryLecturerReportDto, user?: any): Prisma.LecturerReportWhereInput {
        const { search, reportingStageId, validatorId, reporterId, isVerified } = query;

        const where: Prisma.LecturerReportWhereInput = {};

        if (reporterId) {
            where.reporterId = Number(reporterId);
        }

        if (search) {
            where.OR = [
                { content: { contains: search } },
                { notes: { contains: search } }
            ];
        }

        if (reportingStageId) {
            where.reportingStageId = Number(reportingStageId);
        }

        if (validatorId) {
            where.validatorId = Number(validatorId);
        }

        if (isVerified === 'true') {
            where.verifiedAt = { not: null };
        } else if (isVerified === 'false') {
            where.verifiedAt = { equals: null };
        }

        return where;
    }

    async findAll(query: QueryLecturerReportDto, user: any) {
        const { page, limit } = query;
        const where = this.buildWhere(query, user);

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.lecturerReport.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    reportingStage: {
                         include: {
                            reportingPeriode: true
                        }
                    },
                    reporter: true,
                    validator: true
                },
                where,
            }),
            this.prismaService.lecturerReport.count({
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

    async exportExcel(query: QueryLecturerReportDto, user: any): Promise<Buffer> {
        const where = this.buildWhere(query, user);

        const data = await this.prismaService.lecturerReport.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                reportingStage: {
                    include: {
                        reportingPeriode: true
                    }
                },
                reporter: true,
                validator: true
            },
            where,
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Laporan Dosen');

        sheet.columns = [
            { header: 'Nama Laporan', key: 'reportName', width: 30 },
            { header: 'Nama Tahapan', key: 'stageName', width: 25 },
            { header: 'Tanggal Dibuat', key: 'createdAt', width: 20 },
            { header: 'Nama Pelapor', key: 'reporterName', width: 30 },
            { header: 'Nama Validator', key: 'validatorName', width: 30 },
            { header: 'Konten', key: 'content', width: 50 },
            { header: 'Catatan', key: 'notes', width: 30 },
            { header: 'Status Verifikasi', key: 'status', width: 20 },
        ];

        // Style header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9E1F2' },
        };

        data.forEach((report: any) => {
            const plainContent = (report.content || '')
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim();

            sheet.addRow({
                reportName: report.reportingStage?.reportingPeriode?.name || '-',
                stageName: report.reportingStage?.stageName || '-',
                createdAt: new Date(report.createdAt).toLocaleString('id-ID'),
                reporterName: report.reporter?.name || '-',
                validatorName: report.validator?.name || '-',
                content: plainContent,
                notes: report.notes || '-',
                status: report.verifiedAt ? 'Terverifikasi' : 'Belum Diverifikasi',
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async findOne(id: number) {
        const data = await this.prismaService.lecturerReport.findUnique({
            where: { id },
            include: {
                reportingStage: true,
                reporter: true,
                validator: true
            }
        });
        if (!data) {
            throw new NotFoundException('Laporan Dosen tidak ditemukan');
        }
        return data;
    }

    async update(id: number, updateDto: UpdateLecturerReportDto) {
        await this.findOne(id);
        
        const data: any = { ...updateDto };

        if (updateDto.reportingStageId) {
            data.reportingStageId = Number(updateDto.reportingStageId);
        }
         if (updateDto.validatorId) {
            data.validatorId = Number(updateDto.validatorId);
        }

        return await this.prismaService.lecturerReport.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.prismaService.lecturerReport.delete({
            where: { id },
        });
    }

    async verify(id: number, verifyDto: any, user: any) {
        const report = await this.findOne(id);
        
        if (report.validatorId !== user.official?.id) {
             throw new ForbiddenException("Anda tidak memiliki akses untuk memverifikasi laporan ini");
        }

        const data: any = {};
        
        if (verifyDto.notes) {
            data.notes = verifyDto.notes;
        }

        if (verifyDto.isVerified) {
             data.verifiedAt = new Date();
        } else if (verifyDto.isVerified === false) {
             data.verifiedAt = null;
        }

        return await this.prismaService.lecturerReport.update({
             where: { id },
             data
        });
    }

    async getReportsToVerify(query: QueryLecturerReportDto, user: any) {
        if (!user.official) {
             throw new ForbiddenException("Hanya official yang dapat memverifikasi laporan");
        }
        
        const { page, limit, search, reportingStageId } = query;

        const where: Prisma.LecturerReportWhereInput = {
            validatorId: user.official.id
        };
        
         if (search) {
            where.OR = [
                { content: { contains: search } },
                 { notes: { contains: search } }
            ];
        }

        if (reportingStageId) {
            where.reportingStageId = Number(reportingStageId);
        }

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.lecturerReport.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'asc' },
                 include: {
                    reportingStage: {
                         include: {
                            reportingPeriode: true
                        }
                    },
                    reporter: true,
                    validator: true
                },
                where,
            }),
            this.prismaService.lecturerReport.count({
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
}
