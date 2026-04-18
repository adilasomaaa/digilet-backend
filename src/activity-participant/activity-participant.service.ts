import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryActivityParticipantDto } from './dto/query-activity-participant.dto';
import { Prisma } from '@prisma/client';
import { AttendActivityDto } from '../activity/dto/attend-activity.dto';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Stream } from 'stream';


@Injectable()
export class ActivityParticipantService {
    constructor(private prismaService: PrismaService) {}

    async findAll(query: QueryActivityParticipantDto) {
        const { page , limit , search, activityId } = query;

        const where: Prisma.ActivityParticipantWhereInput = {};

        if (activityId) {
            where.activityId = Number(activityId);
        }

        if (search) {
            where.OR = [
                {
                    user: {
                        OR: [
                            { name: { contains: search } },
                            { student: { fullname: { contains: search } } },
                            { official: { name: { contains: search } } }
                        ]
                    },
                },
            ];
        }


        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.activityParticipant.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        include: {
                            student: true,
                            official: true,
                        }
                    }
                }
            }),
            this.prismaService.activityParticipant.count({ where }),
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
        const data = await this.prismaService.activityParticipant.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        student: true,
                        official: true,
                    }
                },
                activity: true,
            }
        });
        if (!data) {
            throw new NotFoundException('Activity-Participant tidak ditemukan');
        }
        return data;
    }


    async remove(id: number) {
        await this.findOne(id);
        return await this.prismaService.activityParticipant.delete({
            where: { id },
        });
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    async attend(uniqueCode: string, attendDto: AttendActivityDto, file: Express.Multer.File) {
        const activity = await this.prismaService.activity.findFirst({
            where: { uniqueCode },
        });

        if (!activity) {
            throw new NotFoundException('Activity tidak ditemukan');
        }

        if (activity.coordinates) {
            if (!attendDto.latitude || !attendDto.longitude) {
                throw new BadRequestException('Lokasi anda tidak diketahui, harap aktifkan GPS.');
            }
            const coords = activity.coordinates.split(','); 
            if (coords.length === 2) {
                const actLat = parseFloat(coords[0].trim());
                const actLng = parseFloat(coords[1].trim());
                const userLat = parseFloat(attendDto.latitude);
                const userLng = parseFloat(attendDto.longitude);
                
                const distance = this.calculateDistance(actLat, actLng, userLat, userLng);
                if (distance > 300) {
                    throw new BadRequestException(`Anda berada terlalu jauh dari lokasi kegiatan (Jarak: ${Math.round(distance)} meter). Radius yang diizinkan adalah 300 meter.`);
                }
            }
        }

        let user;
        if (activity.target === 'student') {
            const student = await this.prismaService.student.findUnique({
                where: { nim: attendDto.identifier },
                include: { user: true },
            });
            if (!student) throw new NotFoundException('Data Mahasiswa tidak ditemukan dengan NIM tersebut.');
            user = student.user;
        } else if (activity.target === 'lecturer') {
            const official = await this.prismaService.official.findUnique({
                where: { nip: attendDto.identifier },
                include: { user: true },
            });
            if (!official || !official.user) throw new NotFoundException('Data Dosen tidak ditemukan dengan NIP tersebut atau belum memiliki akun.');
            user = official.user;
        }

        if (!user) {
            throw new NotFoundException('User tidak valid');
        }

        const existingParticipant = await this.prismaService.activityParticipant.findFirst({
            where: {
                activityId: activity.id,
                userId: user.id
            }
        });

        if (existingParticipant) {
             throw new BadRequestException('Anda sudah melakukan absensi pada kegiatan ini.');
        }

        let proofPath: string | null = null;
        if (file) {
            const fullPath = file.path.replace(/\\/g, '/'); // ensure forward slashes
            proofPath = fullPath.replace('public/', '');
        }

        return await this.prismaService.activityParticipant.create({
            data: {
                activityId: activity.id,
                userId: user.id,
                isVerified: false, // Default to false, let admin verify later as requested
                proofOfAttendance: proofPath
            }
        });
    }

    async verify(id: number) {
        await this.findOne(id);
        return await this.prismaService.activityParticipant.update({
            where: { id },
            data: { isVerified: true },
        });
    }

    async verifyBulk(ids: number[]) {
        return await this.prismaService.activityParticipant.updateMany({
            where: {
                id: { in: ids },
            },
            data: { isVerified: true },
        });
    }

    async checkLocation(uniqueCode: string, lat: number, lng: number) {
        const activity = await this.prismaService.activity.findFirst({
            where: { uniqueCode },
        });

        if (!activity) {
            throw new NotFoundException('Activity tidak ditemukan');
        }

        if (!activity.coordinates) {
             return { isWithinRadius: true, distance: 0 }; // No location required
        }

        const coords = activity.coordinates.split(','); 
        if (coords.length !== 2) {
             return { isWithinRadius: true, distance: 0 };
        }

        const actLat = parseFloat(coords[0].trim());
        const actLng = parseFloat(coords[1].trim());
        
        const distance = this.calculateDistance(actLat, actLng, lat, lng);
        
        return {
            isWithinRadius: distance <= 100, // User requested 100 meters
            distance: Math.round(distance),
            allowedRadius: 100
        };
    }

    async validateParticipant(uniqueCode: string, identifier: string) {
        const activity = await this.prismaService.activity.findFirst({
            where: { uniqueCode },
        });

        if (!activity) {
            throw new NotFoundException('Activity tidak ditemukan');
        }

        let user;
        if (activity.target === 'student') {
            user = await this.prismaService.student.findUnique({
                where: { nim: identifier },
                include: { user: true },
            });
        } else {
            user = await this.prismaService.official.findUnique({
                where: { nip: identifier },
                include: { user: true },
            });
        }

        if (!user) {
            throw new NotFoundException(`${activity.target === 'student' ? 'Mahasiswa' : 'Dosen'} tidak ditemukan`);
        }

        return {
            valid: true,
            user: {
                id: user.user.id,
                name: (user as any).fullname || (user as any).name,
                identifier: identifier
            }
        };
    }

    async exportExcel(activityId: number) {
        const activity = await this.prismaService.activity.findUnique({
            where: { id: activityId },
        });

        if (!activity) throw new NotFoundException('Kegiatan tidak ditemukan');

        const participants = await this.prismaService.activityParticipant.findMany({
            where: { activityId },
            include: {
                user: {
                    include: {
                        student: true,
                        official: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Peserta Kegiatan');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Nama Lengkap', key: 'name', width: 30 },
            { header: 'NIM/NIP', key: 'identifier', width: 20 },
            { header: 'Status Verifikasi', key: 'status', width: 20 },
            { header: 'Waktu Absensi', key: 'time', width: 25 },
        ];

        participants.forEach((p, index) => {
            const name = p.user.student?.fullname || p.user.official?.name || p.user.name;
            const identifier = p.user.student?.nim || p.user.official?.nip || '-';
            
            worksheet.addRow({
                no: index + 1,
                name,
                identifier,
                status: p.isVerified ? 'Terverifikasi' : 'Pending',
                time: p.createdAt.toLocaleString('id-ID'),
            });
        });

        worksheet.getRow(1).font = { bold: true };
        
        return await workbook.xlsx.writeBuffer();
    }

    async exportPdf(activityId: number): Promise<Buffer> {
        const activity = await this.prismaService.activity.findUnique({
            where: { id: activityId },
        });

        if (!activity) throw new NotFoundException('Kegiatan tidak ditemukan');

        const participants = await this.prismaService.activityParticipant.findMany({
            where: { activityId },
            include: {
                user: {
                    include: {
                        student: true,
                        official: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // Header
            doc.fontSize(20).text('Daftar Hadir Peserta Kegiatan', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Nama Kegiatan: ${activity.activityName}`);
            doc.text(`Tanggal: ${activity.implementationDate.toLocaleDateString('id-ID')}`);
            doc.text(`Lokasi: ${activity.location || '-'}`);
            doc.moveDown();

            // Table Header
            const tableTop = 200;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('No', 50, tableTop);
            doc.text('Nama Lengkap', 80, tableTop);
            doc.text('NIM/NIP', 280, tableTop);
            doc.text('Status', 400, tableTop);
            doc.text('Waktu', 480, tableTop);

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Data
            let y = tableTop + 25;
            doc.font('Helvetica');
            participants.forEach((p, index) => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
                const name = p.user.student?.fullname || p.user.official?.name || p.user.name;
                const identifier = p.user.student?.nim || p.user.official?.nip || '-';
                
                doc.text((index + 1).toString(), 50, y);
                doc.text(name, 80, y, { width: 190 });
                doc.text(identifier, 280, y);
                doc.text(p.isVerified ? 'Ok' : 'Pnd', 400, y);
                doc.text(p.createdAt.toLocaleTimeString('id-ID'), 480, y);
                
                y += 20;
            });

            doc.end();
        });
    }

    async findMyActivities(userId: number, query: QueryActivityParticipantDto) {
        const { page, limit, search } = query;

        const where: Prisma.ActivityParticipantWhereInput = {
            userId: userId
        };

        if (search) {
            where.activity = {
                activityName: { contains: search }
            };
        }

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.activityParticipant.findMany({
                where,
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    activity: true
                }
            }),
            this.prismaService.activityParticipant.count({ where }),
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