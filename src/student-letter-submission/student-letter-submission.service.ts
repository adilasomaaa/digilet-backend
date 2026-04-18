import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentLetterSubmissionDto } from './dto/create-student-letter-submission.dto';
import { UpdateStudentLetterSubmissionDto } from './dto/update-student-letter-submission.dto';
import { VerifyStudentLetterSubmissionDto } from './dto/verify-student-letter-submission.dto';
import { ChangeStatusStudentLetterSubmissionDto } from './dto/change-status-student-letter-submission.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStudentLetterSubmissionDto } from './dto/query-student-letter-submission.dto';
import { Prisma, SignatureType } from '@prisma/client';
import { LetterTemplateService } from '../common/services/letter-template.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { join } from 'path';
import { UpdateCCStudentLetterSubmissionDto } from './dto/update-cc-student-letter-submission.dto';
import { getAccessibleInstitutionIds } from '../common/helpers/institution-access.helper';

@Injectable()
export class StudentLetterSubmissionService {
  constructor(
    private prismaService: PrismaService,
    private letterTemplateService: LetterTemplateService,
  ) {}

  async create(
    createDto: CreateStudentLetterSubmissionDto,
    user: any,
    files?: Express.Multer.File[],
  ) {
    const { letterId } = createDto;

    const student = await this.prismaService.student.findUnique({
      where: { id: user.student.id },
      include: { user: true, institution: true },
    });

    if (!student) {
      throw new NotFoundException('Mahasiswa tidak ditemukan');
    }

    const institutionId = student.institutionId;

    const requiredAttributes =
      await this.prismaService.letterAttribute.findMany({
        where: {
          letterId: letterId,
          isRequired: true,
        },
      });

    const attributesArray = Array.isArray(createDto.attributes)
      ? createDto.attributes
      : [];
    const documentsArray = Array.isArray(createDto.documents)
      ? createDto.documents
      : [];

    for (const attr of requiredAttributes) {
      const isProvided = attributesArray?.find(
        (a) => a.attributeId === attr.id && a.content?.trim() !== '',
      );
      if (!isProvided) {
        throw new BadRequestException(
          `Atribut "${attr.attributeName}" wajib diisi.`,
        );
      }
    }

    const requiredDocuments = await this.prismaService.letterDocument.findMany({
      where: {
        letterId: letterId,
        isRequired: true,
      },
    });

    const allLetterDocuments = await this.prismaService.letterDocument.findMany(
      {
        where: {
          letterId: letterId,
        },
      },
    );

    const requiredDocumentCount = requiredDocuments.length;
    if (files && files.length !== requiredDocumentCount) {
      files.forEach((file) => {
        if (fs.existsSync(join(process.cwd(), file.path))) {
          fs.unlinkSync(join(process.cwd(), file.path));
        }
      });
      throw new BadRequestException(
        `Jumlah file yang diupload (${files.length}) tidak sesuai dengan dokumen yang diperlukan (${requiredDocumentCount}).`,
      );
    }

    for (let i = 0; i < requiredDocuments.length; i++) {
      const document = requiredDocuments[i];
      const file = files?.[i];

      if (!file) {
        throw new BadRequestException(
          `Dokumen "${document.documentName}" wajib diupload.`,
        );
      }

      const expectedFileType = document.fileType.toLowerCase();
      const actualFileType = file.mimetype;

      let isValidType = false;
      switch (expectedFileType) {
        case 'pdf':
          isValidType = actualFileType === 'application/pdf';
          break;
        case 'jpg':
        case 'jpeg':
          isValidType =
            actualFileType === 'image/jpeg' || actualFileType === 'image/jpg';
          break;
        case 'png':
          isValidType = actualFileType === 'image/png';
          break;
        case 'gif':
          isValidType = actualFileType === 'image/gif';
          break;
        case 'doc':
          isValidType = actualFileType === 'application/msword';
          break;
        case 'docx':
          isValidType =
            actualFileType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xls':
          isValidType = actualFileType === 'application/vnd.ms-excel';
          break;
        case 'xlsx':
          isValidType =
            actualFileType ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'txt':
          isValidType = actualFileType === 'text/plain';
          break;
        default:
          isValidType = true;
          break;
      }

      if (!isValidType) {
        files.forEach((f) => {
          if (fs.existsSync(join(process.cwd(), f.path))) {
            fs.unlinkSync(join(process.cwd(), f.path));
          }
        });
        throw new BadRequestException(
          `File untuk dokumen "${document.documentName}" harus berformat ${expectedFileType.toUpperCase()}.`,
        );
      }
    }

    if (!institutionId) {
      throw new BadRequestException(
        'User ini tidak terasosiasi dengan institusi manapun.',
      );
    }


    const letter = await this.prismaService.letter.findUnique({
      where: {
        id: letterId,
      },
    });

    const token = randomUUID();
    const name =
      letter?.letterName + ' - ' + student.fullname + '(' + student.nim + ')';

    const submissionData = {
      token,
      name,
      letterId,
      status: 'pending' as const,
      studentId: student.id,
    };

    const documentSubmissions: {
      letterDocumentId: number;
      filePath: string;
    }[] = [];
    if (files && documentsArray) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const documentInfo = documentsArray[i];

        if (documentInfo && file) {
          const fullPath = file.path;
          const cleanedPath = fullPath.replace('public/', '');

          documentSubmissions.push({
            letterDocumentId: documentInfo.letterDocumentId,
            filePath: cleanedPath,
          });
        }
      }
    }

    const letterAttributeSubmissions: {
      letterAttributeId: number;
      content: string;
    }[] = [];
    if (attributesArray) {
      for (const attr of attributesArray) {
        letterAttributeSubmissions.push({
          letterAttributeId: attr.attributeId,
          content: attr.content,
        });
      }
    }

    return await this.prismaService.studentLetterSubmission.create({
      data: {
        ...submissionData,
        documentSubmissions: {
          create: documentSubmissions,
        },
        letterAttributeSubmissions: {
          create: letterAttributeSubmissions,
        },
      },
      include: {
        documentSubmissions: true,
        letterAttributeSubmissions: true,
      },
    });
  }

  async findAll(query: QueryStudentLetterSubmissionDto, user: any) {
    const { page, limit, search } = query;

    const where: Prisma.StudentLetterSubmissionWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { letterNumber: { contains: search } },
        { student: { fullname: { contains: search } } },
        { student: { nim: { contains: search } } },
      ];
    }

    // Apply hierarchical institution filtering for personnel
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
          // Filter by student's institution being in accessible institutions
          where.student = {
            institutionId: { in: accessibleIds },
          };
        }
        // If accessibleIds is null, no filter is applied (full access)
      }
    }

    if (user.roles.name === 'student') {
      where.studentId = user.student.id;
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.studentLetterSubmission.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          student: {
            include: {
              user: true,
              institution: true,
            },
          },
          letter: {
            include: {
              institution: true,
            },
          },
          letterSignatures: {
            include: {
              official: true,
            },
          },
          documentSubmissions: {
            include: {
              letterDocument: true,
            },
          },
          letterAttributeSubmissions: {
            include: {
              letterAttribute: true,
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
        letter: {
          include: {
            institution: true,
          },
        },
        letterSignatures: {
          include: {
            official: true,
          },
        },
        documentSubmissions: {
          include: {
            letterDocument: true,
          },
        },
        letterAttributeSubmissions: {
          include: {
            letterAttribute: true,
          },
        },
      },
    });
    if (!data) {
      throw new NotFoundException('Student letter submission tidak ditemukan');
    }
    return data;
  }

  async updateCarbonCopy(id: number, updateDto: UpdateCCStudentLetterSubmissionDto) {
    await this.findOne(id);
    return await this.prismaService.studentLetterSubmission.update({
      where: { id },
      data: updateDto,
    });
  }

  async update(
    id: number,
    updateDto: UpdateStudentLetterSubmissionDto,
    user: any,
    files?: Express.Multer.File[],
  ) {
    const submission = await this.findOne(id);
    const { attributes, documents, ...rest } = updateDto;

    const attributesArray = Array.isArray(attributes) ? attributes : [];
    const documentsArray = Array.isArray(documents) ? documents : [];

    if (attributesArray.length > 0) {
      for (const attr of attributesArray) {
        const existingAttr = submission.letterAttributeSubmissions.find(
          (a) => a.letterAttributeId === attr.attributeId,
        );

        if (existingAttr) {
          await this.prismaService.letterAttributeSubmission.update({
            where: { id: existingAttr.id },
            data: { content: attr.content },
          });
        }
      }
    }

    if (files && files.length > 0 && documentsArray.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const documentInfo = documentsArray[i];

        if (documentInfo && file) {
          const fullPath = file.path;
          const cleanedPath = fullPath.replace('public/', '');

          const existingDoc = submission.documentSubmissions.find(
            (d) => d.letterDocumentId === documentInfo.letterDocumentId,
          );

          if (existingDoc) {
            const oldPath = join(process.cwd(), 'public', existingDoc.filePath);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
            await this.prismaService.documentSubmission.update({
              where: { id: existingDoc.id },
              data: { filePath: cleanedPath },
            });
          } else {
            await this.prismaService.documentSubmission.create({
              data: {
                studentLetterSubmissionId: id,
                letterDocumentId: documentInfo.letterDocumentId,
                filePath: cleanedPath,
              },
            });
          }
        }
      }
    }

    return await this.prismaService.studentLetterSubmission.update({
      where: { id },
      data: rest,
    });
  }

  async verify(
    id: number,
    verifyDto: VerifyStudentLetterSubmissionDto,
    user: any,
  ) {
    if (user.roles.name !== 'personnel') {
      throw new BadRequestException(
        'Hanya personnel yang dapat melakukan verifikasi',
      );
    }

    const { attributes, letterDate, ...rest } = verifyDto;
    const attributesArray = Array.isArray(attributes) ? attributes : [];

    const submission = await this.findOne(id);

    // Update attributes if provided
    if (attributesArray.length > 0) {
      for (const attr of attributesArray) {
        const existingAttr = submission.letterAttributeSubmissions.find(
          (a) => a.letterAttributeId === attr.attributeId,
        );
        if (existingAttr) {
          await this.prismaService.letterAttributeSubmission.update({
            where: { id: existingAttr.id },
            data: { content: attr.content },
          });
        }
      }
    }

    return await this.prismaService.studentLetterSubmission.update({
      where: { id },
      data: {
        letterDate: new Date(letterDate),
        ...rest,
        status: 'waiting_signature',
      },
    });
  }

  async changeStatus(
    id: number,
    changeStatusDto: ChangeStatusStudentLetterSubmissionDto,
    user: any,
  ) {
    if (user.roles.name !== 'personnel') {
      throw new BadRequestException(
        'Hanya personnel yang dapat mengubah status',
      );
    }

    return await this.prismaService.studentLetterSubmission.update({
      where: { id },
      data: {
        status: changeStatusDto.status,
      },
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
              official: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
          letterAttributeSubmissions: {
            include: {
              letterAttribute: true,
            },
          },
          letterAttachments: true,
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
      officialName: sig.official.name,
      officialPosition: sig.occupation,
      officialNip: sig.uniqueCode,
      position: sig.position || 'right',
    }));

    // Prepare letter attributes data for placeholder replacement
    const letterAttributes = submission.letterAttributeSubmissions.map(
      (submission) => ({
        placeholder: submission.letterAttribute.attributeName,
        content: submission.content,
      }),
    );

    const carbonCopy = submission.carbonCopy || '';
    
    // Prepare attachments
    const attachments = submission.letterAttachments
      ? submission.letterAttachments
          .filter(att => att.isVisible)
          .map(att => att.content)
      : [];

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
        carbonCopy,
        attachments,
      } as any,
      baseUrl,
    );
  }

  async getLetterData(
    token: string,
    baseUrl: string = 'http://localhost:3000',
  ) {
    const submission =
      await this.prismaService.studentLetterSubmission.findUnique({
        where: { token },
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
              official: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
          letterAttributeSubmissions: {
            include: {
              letterAttribute: true,
            },
          },
          letterAttachments: true,
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
      officialName: sig.official.name,
      officialPosition: sig.occupation || '',
      officialNip: sig.uniqueCode || '',
      position: sig.position || 'right',
      isAcknowledged: sig.isAcknowledged,
      signatureType: submission.signatureType,
    }));

    // Prepare letter attributes data for placeholder replacement
    const letterAttributes = submission.letterAttributeSubmissions.map(
      (submission) => ({
        placeholder: submission.letterAttribute.attributeName,
        content: submission.content,
      }),
    );

    const carbonCopy = submission.carbonCopy || '';

    // Prepare attachments
    const attachments = submission.letterAttachments
      ? submission.letterAttachments
          .filter((att) => att.isVisible)
          .map((att) => att.content)
      : [];

    // Get letter data using template service
    return this.letterTemplateService.getLetterData(
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
        carbonCopy,
        attachments,
      },
      baseUrl,
    );
  }
}
