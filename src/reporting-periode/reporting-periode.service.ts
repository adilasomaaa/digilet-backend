import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReportingPeriodeDto } from './dto/create-reporting-periode.dto';
import { UpdateReportingPeriodeDto } from './dto/update-reporting-periode.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryReportingPeriodeDto } from './dto/query-reporting-periode.dto';
import { Prisma, ReportScopes, InstitutionType } from '@prisma/client';
import { getAccessibleInstitutionIds } from 'src/common/helpers/institution-access.helper';


@Injectable()
export class ReportingPeriodeService {
    constructor(private prismaService: PrismaService) {}

    async create(createDto: CreateReportingPeriodeDto, user: any) {
        const userId = user.id

        if(user.roles.name == 'admin') {
            throw new BadRequestException('Admin tidak dapat membuat reporting periode');
        }

        return await this.prismaService.reportingPeriodes.create({
            data: {
                ...createDto,
                userId,
            },
        });
    }

    async findAll(query: QueryReportingPeriodeDto, user: any) {
        const { page , limit , search } = query;

        const where: Prisma.ReportingPeriodesWhereInput = {};

        
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
                    if (personnel.institution.type === InstitutionType.faculty) {
                        accessibleIds.push(personnel.institutionId!);
                    }
                    where.institutionId = { in: accessibleIds };
                }
            }
        }
        
        if (user?.roles?.name === 'student') {
            const student = await this.prismaService.student.findUnique({
                where: { userId: user.id },
                include: { institution: true },
            });

            if (student) {
                where.targetUser = 'student';
                
                const orConditions: Prisma.ReportingPeriodesWhereInput[] = [
                    { institutionId: student.institutionId }
                ];

                if (student.institution.parentId) {
                    orConditions.push({
                        institutionId: student.institution.parentId,
                        scope: ReportScopes.faculty
                    });
                }

                where.OR = orConditions;
            }
        }

        if (user?.roles?.name === 'lecturer') {
            const lecturer = await this.prismaService.official.findUnique({
                where: { userId: user.id },
                include: { institution: true },
            });

            if (lecturer) {
                 where.targetUser = 'lecturer';

                 const orConditions: Prisma.ReportingPeriodesWhereInput[] = [
                    { institutionId: lecturer.institutionId! }
                ];

                 if (lecturer.institution?.parentId) {
                    orConditions.push({
                        institutionId: lecturer.institution.parentId,
                        scope: ReportScopes.faculty
                    });
                }

                where.OR = orConditions;
                
                if (query.verifyTarget === 'student') {
                    // Lecturer verifying student reports
                    // We need to find periods where there are student reports assigned to this lecturer (officialId)
                    where.reportingStages = {
                         some: {
                             studentReports: {
                                 some: {
                                     officialId: lecturer.id
                                 }
                             }
                         }
                    };
                    // Override targetUser because verifying student reports means targetUser=student
                    where.targetUser = 'student'; 
                } else if (query.verifyTarget === 'lecturer') {
                    // Lecturer verifying other lecturer reports (as validator)
                     where.reportingStages = {
                         some: {
                             lecturerReports: {
                                 some: {
                                     validatorId: lecturer.id
                                 }
                             }
                         }
                    };
                    where.targetUser = 'lecturer';
                }
            }
        }
        
        if (search) {
            where.OR = [{ name: { contains: search } }];
        }


        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.reportingPeriodes.findMany({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                where,
                include: {
                    institution: true,
                    user:true,
                    reportingStages: ['student', 'lecturer'].includes(user?.roles?.name) ? {
                        orderBy: { stageOrder: 'asc' }
                    } : undefined
                },
                orderBy: { createdAt: 'asc' },
            }),
            this.prismaService.reportingPeriodes.count({ where }),
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
        const data = await this.prismaService.reportingPeriodes.findUnique({
            where: { id },
            include: {
                institution: true
            }
        });
        if (!data) {
            throw new NotFoundException('Reporting-Periode tidak ditemukan');
        }
        return data;
    }

    async update(id: number, updateDto: UpdateReportingPeriodeDto) {
        await this.findOne(id);
        return await this.prismaService.reportingPeriodes.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.prismaService.reportingPeriodes.delete({
            where: { id },
        });
    }
}