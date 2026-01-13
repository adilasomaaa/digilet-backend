import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGeneralLetterSubmissionDto } from './dto/create-general-letter-submission.dto';
import { UpdateGeneralLetterSubmissionDto } from './dto/update-general-letter-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryGeneralLetterSubmissionDto } from './dto/query-general-letter-submission.dto';
import { Prisma } from '@prisma/client';
import { LetterTemplateService } from 'src/common/services/letter-template.service';

@Injectable()
export class GeneralLetterSubmissionService {
  constructor(
    private prismaService: PrismaService,
    private letterTemplateService: LetterTemplateService,
  ) {}

  async create(createDto: CreateGeneralLetterSubmissionDto, user: any) {
    const institutionId = user.institutionId;
    return await this.prismaService.generalLetterSubmission.create({
      data: { ...createDto, institutionId },
    });
  }

  async findAll(query: QueryGeneralLetterSubmissionDto) {
    const { page, limit, search } = query;

    const where: Prisma.GeneralLetterSubmissionWhereInput = {};

    if (search) {
      where.OR = [
        { letterNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.generalLetterSubmission.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        where,
        include: {
          user: true,
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
        },
      }),
      this.prismaService.generalLetterSubmission.count({ where }),
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
    const data = await this.prismaService.generalLetterSubmission.findUnique({
      where: { id },
      include: {
        user: true,
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
      },
    });
    if (!data) {
      throw new NotFoundException('General letter submission tidak ditemukan');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateGeneralLetterSubmissionDto) {
    await this.findOne(id);
    return await this.prismaService.generalLetterSubmission.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.generalLetterSubmission.delete({
      where: { id },
    });
  }

  async printLetter(id: number, baseUrl: string = 'http://localhost:3000') {
    const submission =
      await this.prismaService.generalLetterSubmission.findUnique({
        where: { id },
        include: {
          user: true,
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
      throw new NotFoundException('General letter submission tidak ditemukan');
    }

    // Get letterhead (header)
    const letterhead = submission.letter.letterHead;
    const letterTemplate = submission.letter.letterTemplates[0];

    if (!letterTemplate) {
      throw new NotFoundException('Letter template tidak ditemukan');
    }

    // Prepare recipient info
    const recipientInfo: string[] = [];
    recipientInfo.push(submission.user.email);

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
        recipientName: submission.user.name,
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
        letter: submission.letter,
        letterAttributes,
      },
      baseUrl,
    );
  }

  async printLetterPdf(
    id: number,
    baseUrl: string = 'http://localhost:3000',
  ): Promise<Buffer> {
    const submission =
      await this.prismaService.generalLetterSubmission.findUnique({
        where: { id },
        include: {
          user: true,
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
      throw new NotFoundException('General letter submission tidak ditemukan');
    }

    // Get letterhead (header)
    const letterhead = submission.letter.letterHead;
    const letterTemplate = submission.letter.letterTemplates[0];

    if (!letterTemplate) {
      throw new NotFoundException('Letter template tidak ditemukan');
    }

    // Prepare recipient info
    const recipientInfo: string[] = [];
    recipientInfo.push(submission.user.email);

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
        recipientName: submission.user.name,
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
        letter: submission.letter,
        letterAttributes,
        submission: submission,
      } as any,
      baseUrl,
    );
  }
}
