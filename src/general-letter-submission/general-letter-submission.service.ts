import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGeneralLetterSubmissionDto } from './dto/create-general-letter-submission.dto';
import { UpdateGeneralLetterSubmissionDto } from './dto/update-general-letter-submission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryGeneralLetterSubmissionDto } from './dto/query-general-letter-submission.dto';
import { Prisma } from '@prisma/client';
import { LetterTemplateService } from 'src/common/services/letter-template.service';
import { randomUUID } from 'crypto';
import { UpdateCCGeneralLetterSubmissionDto } from './dto/update-cc-general-letter-submission.dto';

@Injectable()
export class GeneralLetterSubmissionService {
  constructor(
    private prismaService: PrismaService,
    private letterTemplateService: LetterTemplateService,
  ) {}

  async create(createDto: CreateGeneralLetterSubmissionDto, user: any) {
    const { letterId, letterDate, attributes, ...rest } = createDto;
    const userId = user.id;
    const institutionId = user.personnel.institutionId;
    const token = randomUUID();

    const requiredAttributes =
      await this.prismaService.letterAttribute.findMany({
        where: {
          letterId: letterId,
          isRequired: true,
        },
      });

    for (const attr of requiredAttributes) {
      const isProvided = attributes?.find(
        (a) => a.attributeId === attr.id && a.content?.trim() !== '',
      );
      if (!isProvided) {
        throw new BadRequestException(
          `Atribut "${attr.attributeName}" wajib diisi.`,
        );
      }
    }

    if (!institutionId) {
      throw new BadRequestException(
        'User ini tidak terasosiasi dengan institusi manapun.',
      );
    }

    const letterSignatureTemplates =
      await this.prismaService.letterSignatureTemplate.findMany({
        where: {
          letterId: letterId,
        },
      });

    const letterSignatureSubmissions = letterSignatureTemplates.map(
      (template) => ({
        token: randomUUID(),
        code: Math.floor(100000 + Math.random() * 900000)
          .toString()
          .slice(-6),
        letterSignatureTemplate: {
          connect: { id: template.id },
        },
      }),
    );

    return await this.prismaService.generalLetterSubmission.create({
      data: {
        letterDate: letterDate ? new Date(letterDate) : undefined,
        ...rest,
        user: {
          connect: { id: userId },
        },
        letter: {
          connect: { id: letterId },
        },
        ...(institutionId && {
          institution: {
            connect: { id: institutionId },
          },
        }),
        token,
        letterAttributeSubmissions: {
          create:
            attributes?.map((attr) => ({
              content: attr.content,
              letterAttribute: { connect: { id: attr.attributeId } },
            })) || [],
        },
        letterSignatures: {
          create: letterSignatureSubmissions,
        },
      },
      include: {
        letterSignatures: true,
      },
    });
  }

  async findAll(query: QueryGeneralLetterSubmissionDto, user: any) {
    const { page, limit, search } = query;

    const where: Prisma.GeneralLetterSubmissionWhereInput = {};

    if (user.roles.name !== 'admin') {
      where.institutionId = user.personnel.institutionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { letterNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.generalLetterSubmission.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          user: true,
          letter: {
          include: {
            institution: true,
          },
        },
          institution: true,
          letterAttributeSubmissions: {
            include: {
              letterAttribute: true,
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
        letter: {
          include: {
            institution: true,
          },
        },
        institution: true,
        letterAttributeSubmissions: {
          include: {
            letterAttribute: true,
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
        },
      },
    });
    if (!data) {
      throw new NotFoundException('General letter submission tidak ditemukan');
    }
    return data;
  }

  async updateCarbonCopy(id: number, updateDto: UpdateCCGeneralLetterSubmissionDto) {
    const existingSubmission = await this.findOne(id);

    const { carbonCopy } = updateDto;

    return await this.prismaService.generalLetterSubmission.update({
      where: { id },
      data: {
        carbonCopy,
      },
    });
  }

  async update(id: number, updateDto: UpdateGeneralLetterSubmissionDto) {
    const existingSubmission = await this.findOne(id);

    const { attributes, letterDate, ...rest } = updateDto;

    return await this.prismaService.generalLetterSubmission.update({
      where: { id },
      data: {
        ...rest,
        letterDate: letterDate ? new Date(letterDate) : undefined,

        letterAttributeSubmissions: {
          deleteMany: {},
          create:
            attributes?.map((attr: any) => ({
              content: attr.content,
              letterAttribute: { connect: { id: attr.attributeId } },
            })) || [],
        },
      },
      include: {
        letterAttributeSubmissions: true,
      },
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
      isAcknowledged: sig.letterSignatureTemplate.isAcknowledged,
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
    token: string,
    baseUrl: string = 'http://localhost:3000',
  ): Promise<Buffer> {
    const submission =
      await this.prismaService.generalLetterSubmission.findUnique({
        where: { token },
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

    const letterhead = submission.letter.letterHead;
    const letterTemplate = submission.letter.letterTemplates[0];

    if (!letterTemplate) {
      throw new NotFoundException('Letter template tidak ditemukan');
    }

    const recipientInfo: string[] = [];
    recipientInfo.push(submission.user.email);

    const signatures = submission.letterSignatures.map((sig) => ({
      signature: sig.signature || undefined,
      officialName: sig.letterSignatureTemplate.official.name,
      officialPosition: sig.letterSignatureTemplate.official.occupation,
      officialNip: sig.letterSignatureTemplate.official.nip,
      position: sig.letterSignatureTemplate.position || 'right',
      isAcknowledged: sig.letterSignatureTemplate.isAcknowledged,
    }));

    const letterAttributes = submission.letterAttributeSubmissions.map(
      (submission) => ({
        placeholder: submission.letterAttribute.attributeName,
        content: submission.content,
      }),
    );

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
        signatureType: submission.signatureType,
        signatures,
        letter: submission.letter,
        letterAttributes,
        submission: submission,
      } as any,
      baseUrl,
    );
  }
}
