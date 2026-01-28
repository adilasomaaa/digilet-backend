import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User) {
    // Check if user is admin (assuming admin has specific role or permission, but here we just check generally or assume the controller handles guards/roles)
    // Actually, I need to know the user's role to decide what to return.
    // Let's assume the user object passed here has the necessary info or I fetch it.
    // Based on schema, User has userRoles. But here 'user' might just be the payload from JWT.
    // Let's fetch full user with roles just to be sure, or better, rely on what's passed.

    // Let's check if the user is personnel (admin/operator usually are personnel)
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

    // Default to operator stats if not strictly admin, or if both, maybe admin takes precedence?
    // Let's assume if they have an institutionId, they act as operator for that institution.
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
    const totalStudentLettersAccepted = await this.prisma.studentLetterSubmission.count({
        where: { 
            status: 'approved',
            student: {
                institutionId: institutionId
            }
        }
    });
    
    const totalLetterTypes = await this.prisma.letter.count({
        where: { institutionId: institutionId }
    });

    const totalGeneralLetters = await this.prisma.generalLetterSubmission.count({
        where: { institutionId: institutionId }
    });

    const totalStudents = await this.prisma.student.count({
        where: { institutionId: institutionId }
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
      });
  
      const roles = await this.prisma.userRoles.findMany({
          where: { userId: user.id },
          include: { role: true }
      });
      
      const roleNames = roles.map(r => r.role.name);
      const isAdmin = roleNames.includes('admin');
      
      const whereClauseGeneral: any = {};
      const whereClauseStudent: any = { status: 'approved' }; // Only accepted letters

      if (!isAdmin && personnel?.institutionId) {
          whereClauseGeneral.institutionId = personnel.institutionId;
          whereClauseStudent.student = { institutionId: personnel.institutionId };
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
    });

    const roles = await this.prisma.userRoles.findMany({
      where: { userId: user.id },
      include: { role: true }
    });
    
    const roleNames = roles.map(r => r.role.name);
    const isAdmin = roleNames.includes('admin');
    
    const whereClause: any = { status: 'pending' };

    if (!isAdmin && personnel?.institutionId) {
      whereClause.student = { institutionId: personnel.institutionId };
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

    if (!isAdmin && personnel?.institutionId) {
      whereClause.OR = [
        {
          studentLetterSubmission: {
            student: { institutionId: personnel.institutionId }
          }
        },
        {
          generalLetterSubmission: {
            institutionId: personnel.institutionId
          }
        }
      ];
    }

    const recentSignatures = await this.prisma.letterSignature.findMany({
      where: whereClause,
      include: {
        letterSignatureTemplate: {
          include: {
            official: {
              select: {
                name: true,
                occupation: true,
                nip: true,
              }
            }
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
