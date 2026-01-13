import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentLetterSubmissionDto } from './dto/create-student-letter-submission.dto';
import { UpdateStudentLetterSubmissionDto } from './dto/update-student-letter-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryStudentLetterSubmissionDto } from './dto/query-student-letter-submission.dto';
import { Prisma } from '@prisma/client';
import { LetterTemplateService } from 'src/common/services/letter-template.service';

@Injectable()
export class StudentLetterSubmissionService {
  constructor(
    private prismaService: PrismaService,
    private letterTemplateService: LetterTemplateService,
  ) {}

  async create(createDto: CreateStudentLetterSubmissionDto) {
    return await this.prismaService.studentLetterSubmission.create({
      data: createDto,
    });
  }

  async findAll(query: QueryStudentLetterSubmissionDto) {
    const { page, limit, search } = query;

    const where: Prisma.StudentLetterSubmissionWhereInput = {};

    if (search) {
      where.OR = [
        { letterNumber: { contains: search } },
        { student: { fullname: { contains: search } } },
        { student: { nim: { contains: search } } },
      ];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.studentLetterSubmission.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        where,
        include: {
          student: {
            include: {
              user: true,
              institution: true,
            },
          },
          letter: true,
          letterSignatures: {
            include: {
              letterSignatureTemplate: {
                include: {
                  official: true,
                },
              },
            },
          },
          documentSubmissions: {
            include: {
              letterDocument: true,
            },
          },
        },
      }),
      this.prismaService.studentLetterSubmission.count({ where }),
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
    const data = await this.prismaService.studentLetterSubmission.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
            institution: true,
          },
        },
        letter: true,
        letterSignatures: {
          include: {
            letterSignatureTemplate: {
              include: {
                official: true,
              },
            },
          },
        },
        documentSubmissions: {
          include: {
            letterDocument: true,
          },
        },
      },
    });
    if (!data) {
      throw new NotFoundException('Student letter submission tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateStudentLetterSubmissionDto) {
    await this.findOne(id);
    return await this.prismaService.studentLetterSubmission.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.studentLetterSubmission.delete({
      where: { id },
    });
  }

  async printLetter(id: number, baseUrl: string = 'http://localhost:3000') {
    const submission =
      await this.prismaService.studentLetterSubmission.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true,
              institution: true,
            },
          },
          letter: {
            include: {
              letterHead: true,
              letterTemplates: true,
            },
          },
          letterSignatures: {
            include: {
              letterSignatureTemplate: {
                include: {
                  official: true,
                },
              },
            },
            orderBy: {
              letterSignatureTemplate: {
                position: 'asc',
              },
            },
          },
          letterAttributeSubmissions: {
            include: {
              letterAttribute: true,
            },
          },
        },
      });

    if (!submission) {
      throw new NotFoundException('Student letter submission tidak ditemukan');
    }

    // Get letterhead (header)
    const letterhead = submission.letter.letterHead;
    const letterTemplate = submission.letter.letterTemplates[0];

    if (!letterTemplate) {
      throw new NotFoundException('Letter template tidak ditemukan');
    }

    // Prepare recipient info
    const recipientInfo: string[] = [];
    recipientInfo.push(submission.student.nim);
    if (submission.student.institution) {
      recipientInfo.push(submission.student.institution.name);
    }

    // Prepare signatures data
    const signatures = submission.letterSignatures.map((sig) => ({
      signature: sig.signature || undefined,
      officialName: sig.letterSignatureTemplate.official.name,
      officialPosition: sig.letterSignatureTemplate.official.occupation,
      officialNip: sig.letterSignatureTemplate.official.nip,
      position: sig.letterSignatureTemplate.position || 'right',
    }));

    // Prepare letter attributes data for placeholder replacement
    const letterAttributes = submission.letterAttributeSubmissions.map(
      (submission) => ({
        placeholder: submission.letterAttribute.attributeName,
        content: submission.content,
      }),
    );

    // Generate HTML using template service
    return this.letterTemplateService.generatePrintHtml(
      {
        letterNumber: submission.letterNumber || undefined,
        recipientName: submission.student.fullname,
        recipientInfo,
        letterContent: letterTemplate.content,
        letterhead: letterhead,
        signatures,
        student: submission.student,
        letter: submission.letter,
        letterAttributes,
        submission: submission,
      } as any,
      baseUrl,
    );
  }

  async printLetterPdf(
    id: number,
    baseUrl: string = 'http://localhost:3000',
  ): Promise<Buffer> {
    const submission =
      await this.prismaService.studentLetterSubmission.findUnique({
        where: { id },
        include: {
          student: {
            include: {
              user: true,
              institution: true,
            },
          },
          letter: {
            include: {
              letterHead: true,
              letterTemplates: true,
              letterAttributes: true,
            },
          },
          letterSignatures: {
            include: {
              letterSignatureTemplate: {
                include: {
                  official: true,
                },
              },
            },
            orderBy: {
              letterSignatureTemplate: {
                position: 'asc',
              },
            },
          },
          letterAttributeSubmissions: {
            include: {
              letterAttribute: true,
            },
          },
        },
      });

    if (!submission) {
      throw new NotFoundException('Student letter submission tidak ditemukan');
    }

    // Get letterhead (header)
    const letterhead = submission.letter.letterHead;
    const letterTemplate = submission.letter.letterTemplates[0];

    if (!letterTemplate) {
      throw new NotFoundException('Letter template tidak ditemukan');
    }

    // Prepare recipient info
    const recipientInfo: string[] = [];
    recipientInfo.push(submission.student.nim);
    if (submission.student.institution) {
      recipientInfo.push(submission.student.institution.name);
    }

    // Prepare signatures data
    const signatures = submission.letterSignatures.map((sig) => ({
      signature: sig.signature || undefined,
      officialName: sig.letterSignatureTemplate.official.name,
      officialPosition: sig.letterSignatureTemplate.official.occupation,
      officialNip: sig.letterSignatureTemplate.official.nip,
      position: sig.letterSignatureTemplate.position || 'right',
    }));

    // Prepare letter attributes data for placeholder replacement
    const letterAttributes = submission.letterAttributeSubmissions.map(
      (submission) => ({
        placeholder: submission.letterAttribute.attributeName,
        content: submission.content,
      }),
    );

    // Generate PDF using template service
    return this.letterTemplateService.generatePdf(
      {
        letterNumber: submission.letterNumber || undefined,
        recipientName: submission.student.fullname,
        recipientInfo,
        letterContent: letterTemplate.content,
        letterhead: letterhead
          ? {
              logo: letterhead.logo,
              header: letterhead.header,
              subheader: letterhead.subheader || undefined,
              address: letterhead.address || undefined,
            }
          : undefined,
        signatures,
        student: submission.student,
        letter: submission.letter,
        letterAttributes,
      },
      baseUrl,
    );
  }
}
