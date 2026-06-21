import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentReportDto } from './dto/create-student-report.dto';
import { UpdateStudentReportDto } from './dto/update-student-report.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStudentReportDto } from './dto/query-student-report.dto';
import { Prisma } from '@prisma/client';
import { VerifyStudentReportDto } from './dto/verify-student-report.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class StudentReportService {
    constructor(private prismaService: PrismaService) {}

    async create(createDto: CreateStudentReportDto, file: Express.Multer.File, user: any) {
        if (file) {
            const fullPath = file.path;
            const cleanedPath = fullPath.replace('public/', '');
            createDto.documentProved = cleanedPath;
        }

        if (!user.student) {
            throw new NotFoundException('Mahasiswa tidak ditemukan');
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

        const studentId = user.student?.id;
        const dataToCreate: any = {
            studentId,
            ...createDto
        };

        if (createDto.createdAt) {
            dataToCreate.createdAt = new Date(createDto.createdAt);
        } else {
            delete dataToCreate.createdAt;
        }

        return await this.prismaService.studentReport.create({
            data: dataToCreate,
        });
    }

    private buildWhere(query: QueryStudentReportDto, user: any): Prisma.StudentReportWhereInput {
        const { search, reportingStageId, studentId, officialId, isVerified } = query;

        const where: Prisma.StudentReportWhereInput = {};

        if (search) {
            where.OR = [
                {
                    student: {
                        fullname: { contains: search},
                    },
                },
                {
                    student: {
                        nim: { contains: search },
                    },
                },
                {
                    reportingStage: {
                        reportingPeriode: {
                            name: { contains: search },
                        },
                    },
                },
                {
                    reportingStage: {
                        stageName: { contains: search },
                    },
                },
                {
                    official: {
                        name: { contains: search },
                    },
                },
                {
                    official: {
                        nip: { contains: search },
                    },
                }
            ];
        }

        if (reportingStageId) {
            where.reportingStageId = Number(reportingStageId);
        }

        if (studentId) {
            where.studentId = Number(studentId);
        }

        if (officialId) {
            where.officialId = Number(officialId);
        }

        if (user.roles.name === 'student') {
            where.studentId = user.student?.id;
        }

        if (isVerified === 'true') {
            where.verifiedAt = { not: null };
        } else if (isVerified === 'false') {
            where.verifiedAt = { equals: null };
        }

        return where;
    }

    async findAll(query: QueryStudentReportDto, user: any) {
        const { page, limit } = query;
        const where = this.buildWhere(query, user);

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.studentReport.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    reportingStage: {
                        include: {
                            reportingPeriode: true
                        }
                    },
                    official: true,
                    student: true
                },
                where,
            }),
            this.prismaService.studentReport.count({
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

    async exportExcel(query: QueryStudentReportDto, user: any): Promise<Buffer> {
        const where = this.buildWhere(query, user);

        const data = await this.prismaService.studentReport.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                reportingStage: {
                    include: {
                        reportingPeriode: true
                    }
                },
                official: true,
                student: true
            },
            where,
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Laporan Mahasiswa');

        sheet.columns = [
            { header: 'Nama Laporan', key: 'reportName', width: 30 },
            { header: 'Nama Tahapan', key: 'stageName', width: 25 },
            { header: 'Tanggal Dibuat', key: 'createdAt', width: 20 },
            { header: 'Penanggung Jawab', key: 'officialName', width: 15 },
            { header: 'Nama Mahasiswa', key: 'studentName', width: 30 },
            { header: 'NIM', key: 'nim', width: 15 },
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
                officialName: report.official?.name || '-',
                studentName: report.student?.fullname || '-',
                nim: report.student?.nim || '-',
                content: plainContent,
                notes: report.notes || '-',
                status: report.verifiedAt ? 'Terverifikasi' : 'Belum Diverifikasi',
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async findOne(id: number) {
        const data = await this.prismaService.studentReport.findUnique({
            where: { id },
        });
        if (!data) {
            throw new NotFoundException('Student-Report tidak ditemukan');
        }
        return data;
    }

    async update(id: number, updateDto: UpdateStudentReportDto) {
        await this.findOne(id);
        
        return await this.prismaService.studentReport.update({
            where: { id },
            data: updateDto,
        });
    }

    async verify(id: number, updateDto: VerifyStudentReportDto) {
        await this.findOne(id);
        const data: any = {};

        if (updateDto.isVerified) {
            data.verifiedAt = new Date();
        }

        if (updateDto.notes !== undefined) {
            data.notes = updateDto.notes;
        }

        return await this.prismaService.studentReport.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.prismaService.studentReport.delete({
            where: { id },
        });
    }
}