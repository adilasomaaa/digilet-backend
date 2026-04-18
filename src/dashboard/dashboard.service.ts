import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { getAccessibleInstitutionIds } from '../common/helpers/institution-access.helper';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { userId: user.id },
      include: { institution: true },
    });

    const roles = await this.prisma.userRoles.findMany({
        where: { userId: user.id },
        include: { role: true }
    });
    
    const roleNames = roles.map(r => r.role.name);
    const isAdmin = roleNames.includes('admin');
    
    if (isAdmin) {
        return this.getAdminStats();
    }

    if (personnel?.institutionId) {
        return this.getOperatorStats(personnel.institutionId);
    }

    return {};
  }

  async getAdminStats() {
    const totalStudents = await this.prisma.student.count();
    const totalGeneralLetters = await this.prisma.generalLetterSubmission.count();
    const totalStudentLettersAccepted = await this.prisma.studentLetterSubmission.count({
        where: { status: 'approved' }
    });
    const totalOfficials = await this.prisma.official.count();

    return {
        totalStudents,
        totalGeneralLetters,
        totalStudentLettersAccepted,
        totalOfficials
    };
  }

  async getOperatorStats(institutionId: number) {
    // Get institution with type for hierarchical access
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { type: true },
    });

    // Get accessible institution IDs (includes parent and children)
    const accessibleIds = await getAccessibleInstitutionIds(
      this.prisma,
      institutionId,
      institution?.type || 'study_program',
    );

    const institutionFilter = accessibleIds !== null ? { in: accessibleIds } : undefined;

    const totalStudentLettersAccepted = await this.prisma.studentLetterSubmission.count({
      where: { 
        status: 'approved',
        student: {
          institutionId: institutionFilter,
        }
      }
    });
    
    const totalLetterTypes = await this.prisma.letter.count({
      where: { institutionId: institutionFilter }
    });

    const totalGeneralLetters = await this.prisma.generalLetterSubmission.count({
      where: { institutionId: institutionFilter }
    });

    const totalStudents = await this.prisma.student.count({
      where: { institutionId: institutionFilter }
    });

    return {
      totalStudentLettersAccepted,
      totalLetterTypes,
      totalGeneralLetters,
      totalStudents
    };
  }

  async getCharts(user: User) {
    // Similar role check
    const personnel = await this.prisma.personnel.findUnique({
      where: { userId: user.id },
      include: { institution: true },
    });

    const roles = await this.prisma.userRoles.findMany({
      where: { userId: user.id },
      include: { role: true }
    });
    
    const roleNames = roles.map(r => r.role.name);
    const isAdmin = roleNames.includes('admin');
    
    const whereClauseGeneral: any = {};
    const whereClauseStudent: any = { status: 'approved' }; // Only accepted letters

    if (!isAdmin && personnel?.institutionId && personnel?.institution) {
      // Get accessible institution IDs
      const accessibleIds = await getAccessibleInstitutionIds(
        this.prisma,
        personnel.institutionId,
        personnel.institution.type,
      );

      if (accessibleIds !== null) {
        whereClauseGeneral.institutionId = { in: accessibleIds };
        whereClauseStudent.student = { institutionId: { in: accessibleIds } };
      }
    }

    // Fetch all records and aggregate by date in JavaScript
    // This is simpler and avoids raw SQL complexity
    
    const generalItems = await this.prisma.generalLetterSubmission.findMany({
      where: whereClauseGeneral,
      select: { createdAt: true }
    });
    
    const studentItems = await this.prisma.studentLetterSubmission.findMany({
      where: whereClauseStudent,
      select: { createdAt: true }
    });

    const statsMap = new Map<string, { date: string, general: number, student: number }>();

    const addToMap = (date: Date, type: 'general' | 'student') => {
      const dateStr = date.toISOString().split('T')[0];
      if (!statsMap.has(dateStr)) {
        statsMap.set(dateStr, { date: dateStr, general: 0, student: 0 });
      }
      const entry = statsMap.get(dateStr)!;
      if (type === 'general') entry.general++;
      else entry.student++;
    };

    generalItems.forEach(item => addToMap(item.createdAt, 'general'));
    studentItems.forEach(item => addToMap(item.createdAt, 'student'));

    const chartData = Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
  }

  async getRecentPendingLetters(user: User) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { userId: user.id },
      include: { institution: true },
    });

    const roles = await this.prisma.userRoles.findMany({
      where: { userId: user.id },
      include: { role: true }
    });
    
    const roleNames = roles.map(r => r.role.name);
    const isAdmin = roleNames.includes('admin');
    
    const whereClause: any = { status: 'pending' };

    if (!isAdmin && personnel?.institutionId && personnel?.institution) {
      // Get accessible institution IDs
      const accessibleIds = await getAccessibleInstitutionIds(
        this.prisma,
        personnel.institutionId,
        personnel.institution.type,
      );

      if (accessibleIds !== null) {
        whereClause.student = { institutionId: { in: accessibleIds } };
      }
    }

    const recentLetters = await this.prisma.studentLetterSubmission.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            fullname: true,
            nim: true,
          }
        },
        letter: {
          select: {
            letterName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    return recentLetters;
  }

  async getRecentSignatures(user: User) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { userId: user.id },
      include: { institution: true },
    });

    const roles = await this.prisma.userRoles.findMany({
      where: { userId: user.id },
      include: { role: true }
    });
    
    const roleNames = roles.map(r => r.role.name);
    const isAdmin = roleNames.includes('admin');

    // Building where clause for filtering signatures
    const whereClause: any = {
      verifiedAt: { not: null }
    };

    if (!isAdmin && personnel?.institutionId && personnel?.institution) {
      // Get accessible institution IDs
      const accessibleIds = await getAccessibleInstitutionIds(
        this.prisma,
        personnel.institutionId,
        personnel.institution.type,
      );

      if (accessibleIds !== null) {
        whereClause.OR = [
          {
            studentLetterSubmission: {
              student: { institutionId: { in: accessibleIds } }
            }
          },
          {
            generalLetterSubmission: {
              institutionId: { in: accessibleIds }
            }
          }
        ];
      }
    }

    const recentSignatures = await this.prisma.letterSignature.findMany({
      where: whereClause,
      include: {
        official: {
          select: {
            name: true,
            occupation: true,
            nip: true,
          }
        },
        studentLetterSubmission: {
          select: {
            name: true,
            letter: {
              select: {
                letterName: true
              }
            }
          }
        },
        generalLetterSubmission: {
          select: {
            name: true,
            letter: {
              select: {
                letterName: true
              }
            }
          }
        }
      },
      orderBy: {
        verifiedAt: 'desc'
      },
      take: 5
    });

    return recentSignatures;
  }
}
