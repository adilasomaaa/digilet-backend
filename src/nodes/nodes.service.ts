import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { RenameNodeDto } from './dto/rename-node.dto';
import { QueryNodesDto } from './dto/query-nodes.dto';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class NodesService {
  constructor(private prismaService: PrismaService) {}

  async findAll(query: QueryNodesDto, userId: number) {
    const { page = 1, limit = 50, parentId, includeDeleted = false } = query;

    // Get user's institutionId from personnel relation
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { personnel: true },
    });

    const institutionId = user?.personnel?.institutionId;

    // Build where clause based on institution
    const ownerFilter = institutionId
      ? {
          owner: {
            personnel: {
              institutionId: institutionId,
            },
          },
        }
      : { ownerId: userId }; // No institution - only own files

    const where: Prisma.NodesWhereInput = {
      ...ownerFilter,
      parentId: parentId || null,
    };

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.nodes.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prismaService.nodes.count({ where }),
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

  async findTrash(userId: number) {
    // Get user's institutionId from personnel relation
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { personnel: true },
    });

    const institutionId = user?.personnel?.institutionId;

    // Build where clause based on institution
    const ownerFilter = institutionId
      ? {
          owner: {
            personnel: {
              institutionId: institutionId,
            },
          },
        }
      : { ownerId: userId };

    return await this.prismaService.nodes.findMany({
      where: {
        ...ownerFilter,
        deletedAt: { not: null },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const node = await this.prismaService.nodes.findUnique({
      where: { id },
      include: { 
        parent: true, 
        children: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            personnel: {
              select: {
                institutionId: true,
              },
            },
          },
        },
      },
    });

    if (!node) {
      throw new NotFoundException('Node tidak ditemukan');
    }

    // Get current user's institutionId
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { personnel: true },
    });

    const userInstitutionId = user?.personnel?.institutionId;
    const nodeOwnerInstitutionId = node.owner.personnel?.institutionId;

    // Check access: either owner, or same institution
    const hasAccess =
      node.ownerId === userId ||
      (userInstitutionId &&
        nodeOwnerInstitutionId &&
        userInstitutionId === nodeOwnerInstitutionId);

    if (!hasAccess) {
      throw new ForbiddenException('Anda tidak memiliki akses ke node ini');
    }

    return node;
  }

  async getBreadcrumbs(nodeId: number, userId: number) {
    const breadcrumbs: { id: number; name: string }[] = [];
    let currentNode = await this.prismaService.nodes.findUnique({
      where: { id: nodeId },
    });

    if (!currentNode || currentNode.ownerId !== userId) {
      throw new NotFoundException('Node tidak ditemukan');
    }

    while (currentNode) {
      breadcrumbs.unshift({
        id: currentNode.id,
        name: currentNode.name,
      });

      if (currentNode.parentId) {
        currentNode = await this.prismaService.nodes.findUnique({
          where: { id: currentNode.parentId },
        });
      } else {
        currentNode = null;
      }
    }

    return breadcrumbs;
  }

  async createFolder(dto: CreateFolderDto, userId: number) {
    if (dto.parentId) {
      const parent = await this.prismaService.nodes.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.ownerId !== userId) {
        throw new NotFoundException('Parent folder tidak ditemukan');
      }

      if (parent.type !== 'folder') {
        throw new ConflictException('Parent harus berupa folder');
      }
    }


    return await this.prismaService.nodes.create({
      data: {
        name: dto.name,
        type: 'folder',
        parentId: dto.parentId || null,
        ownerId: userId,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    type: 'image' | 'pdf',
    parentId: number | undefined,
    userId: number,
  ) {
    // Validate parent if provided
    if (parentId) {
      const parent = await this.prismaService.nodes.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.ownerId !== userId) {
        throw new NotFoundException('Parent folder tidak ditemukan');
      }

      if (parent.type !== 'folder') {
        throw new ConflictException('Parent harus berupa folder');
      }
    }

    // Extract relative path from public folder
    const relativePath = file.path.replace(/^public\//, '').replace(/\\/g, '/');

    return await this.prismaService.nodes.create({
      data: {
        name: file.originalname,
        type,
        path: relativePath,
        mimeType: file.mimetype,
        size: file.size.toString(),
        parentId: parentId || null,
        ownerId: userId,
      },
    });
  }

  async createLink(dto: CreateLinkDto, userId: number) {
    // Validate parent if provided
    if (dto.parentId) {
      const parent = await this.prismaService.nodes.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.ownerId !== userId) {
        throw new NotFoundException('Parent folder tidak ditemukan');
      }

      if (parent.type !== 'folder') {
        throw new ConflictException('Parent harus berupa folder');
      }
    }

    // Store link content as a text file
    const fileName = `${Date.now()}-${dto.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'nodes', 'links', fileName);

    // Ensure directory exists
    const dir = join(process.cwd(), 'public', 'uploads', 'nodes', 'links');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, dto.content);

    return await this.prismaService.nodes.create({
      data: {
        name: dto.name,
        type: 'link',
        path: `uploads/nodes/links/${fileName}`,
        mimeType: 'text/plain',
        parentId: dto.parentId || null,
        ownerId: userId,
      },
    });
  }

  async rename(id: number, dto: RenameNodeDto, userId: number) {
    const node = await this.findOne(id, userId);

    return await this.prismaService.nodes.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async softDelete(id: number, userId: number) {
    const node = await this.findOne(id, userId);

    // Recursively soft delete all children
    await this.softDeleteChildren(id);

    return await this.prismaService.nodes.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async softDeleteChildren(parentId: number) {
    const children = await this.prismaService.nodes.findMany({
      where: { parentId },
    });

    for (const child of children) {
      await this.softDeleteChildren(child.id);
      await this.prismaService.nodes.update({
        where: { id: child.id },
        data: { deletedAt: new Date() },
      });
    }
  }

  async restore(id: number, userId: number) {
    const node = await this.prismaService.nodes.findUnique({
      where: { id },
    });

    if (!node) {
      throw new NotFoundException('Node tidak ditemukan');
    }

    if (node.ownerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke node ini');
    }

    if (!node.deletedAt) {
      throw new ConflictException('Node tidak berada di tempat sampah');
    }

    // Restore the node and all its children
    await this.restoreChildren(id);

    return await this.prismaService.nodes.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  private async restoreChildren(parentId: number) {
    const children = await this.prismaService.nodes.findMany({
      where: { parentId },
    });

    for (const child of children) {
      await this.restoreChildren(child.id);
      await this.prismaService.nodes.update({
        where: { id: child.id },
        data: { deletedAt: null },
      });
    }
  }

  async permanentDelete(id: number, userId: number) {
    const node = await this.prismaService.nodes.findUnique({
      where: { id },
    });

    if (!node) {
      throw new NotFoundException('Node tidak ditemukan');
    }

    if (node.ownerId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke node ini');
    }

    // Delete physical file if exists
    if (node.path) {
      const filePath = join(process.cwd(), 'public', node.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Recursively delete all children
    await this.permanentDeleteChildren(id);

    return await this.prismaService.nodes.delete({
      where: { id },
    });
  }

  private async permanentDeleteChildren(parentId: number) {
    const children = await this.prismaService.nodes.findMany({
      where: { parentId },
    });

    for (const child of children) {
      await this.permanentDeleteChildren(child.id);

      // Delete physical file if exists
      if (child.path) {
        const filePath = join(process.cwd(), 'public', child.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await this.prismaService.nodes.delete({
        where: { id: child.id },
      });
    }
  }

  async clearTrash(userId: number) {
    // Get user's institutionId from personnel relation
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { personnel: true },
    });

    const institutionId = user?.personnel?.institutionId;

    // Build where clause based on institution
    const ownerFilter = institutionId
      ? {
          owner: {
            personnel: {
              institutionId: institutionId,
            },
          },
        }
      : { ownerId: userId };

    // Get all trash items first to delete their children
    const trashedNodes = await this.prismaService.nodes.findMany({
      where: {
        ...ownerFilter,
        deletedAt: { not: null },
        parentId: null,
      },
    });

    // Permanently delete each one
    for (const node of trashedNodes) {
      await this.permanentDelete(node.id, userId);
    }

    return { message: 'Tempat sampah berhasil dikosongkan' };
  }

  async saveLetterPdfToArchive(
    pdfPath: string,
    fileName: string,
    userId: number,
    parentId?: number,
  ) {
    const axios = require('axios');
    const { createWriteStream } = require('fs');
    const { pipeline } = require('stream/promises');

    // Validate parent if provided
    if (parentId) {
      const parent = await this.prismaService.nodes.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent folder tidak ditemukan');
      }

      // Check access
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { personnel: true },
      });

      const userInstitutionId = user?.personnel?.institutionId;
      const parentOwner = await this.prismaService.user.findUnique({
        where: { id: parent.ownerId },
        include: { personnel: true },
      });
      const parentOwnerInstitutionId = parentOwner?.personnel?.institutionId;

      const hasAccess =
        parent.ownerId === userId ||
        (userInstitutionId &&
          parentOwnerInstitutionId &&
          userInstitutionId === parentOwnerInstitutionId);

      if (!hasAccess) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke folder ini',
        );
      }

      if (parent.type !== 'folder') {
        throw new ConflictException('Parent harus berupa folder');
      }
    }

    try {
      // Construct full URL for internal request
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}/${pdfPath}`;

      // Create unique filename
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-z0-9._-]/gi, '_');
      const uniqueFileName = `${timestamp}-${sanitizedFileName}`;

      // Ensure directory exists
      const uploadDir = join(
        process.cwd(),
        'public',
        'uploads',
        'nodes',
        'pdfs',
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = join(uploadDir, uniqueFileName);

      // Download PDF from internal endpoint
      const response = await axios({
        method: 'GET',
        url: fullUrl,
        responseType: 'stream',
      });

      // Save to file system
      await pipeline(response.data, createWriteStream(filePath));

      // Get file stats
      const stats = fs.statSync(filePath);

      // Create node entry
      return await this.prismaService.nodes.create({
        data: {
          name: fileName,
          type: 'pdf',
          path: `uploads/nodes/pdfs/${uniqueFileName}`,
          mimeType: 'application/pdf',
          size: stats.size.toString(),
          parentId: parentId || null,
          ownerId: userId,
        },
      });
    } catch (error) {
      throw new ConflictException(
        `Gagal mengunduh PDF: ${error.message || 'Unknown error'}`,
      );
    }
  }
}

