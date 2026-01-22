import { Injectable, BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_BASE_PATH = './public/uploads';

@Injectable()
export class FileUploadService {
  private getStorage(subfolder: string): any {
    const uploadPath = join(UPLOAD_BASE_PATH, subfolder);

    return diskStorage({
      destination: (req, file, cb) => {
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    });
  }

  public getImageUploadOptions(path: string): MulterOptions {
    return {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'File tidak valid. Hanya format gambar (JPG, JPEG, PNG, GIF) yang diizinkan.',
            ),
            false,
          );
        }
      },
      storage: this.getStorage(path),

      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  public getPdfUploadOptions(path: string): MulterOptions {
    return {
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'File tidak valid. Hanya format PDF yang diizinkan.',
            ),
            false,
          );
        }
      },
      storage: this.getStorage(path),

      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    };
  }

  public getDynamicFileUploadOptions(
    path: string,
    allowedFileTypes: string[],
  ): MulterOptions {
    return {
      fileFilter: (req, file, cb) => {
        // Convert file types to mime types
        const allowedMimeTypes = allowedFileTypes
          .map((type) => {
            switch (type.toLowerCase()) {
              case 'pdf':
                return 'application/pdf';
              case 'jpg':
              case 'jpeg':
                return ['image/jpeg', 'image/jpg'];
              case 'png':
                return 'image/png';
              case 'gif':
                return 'image/gif';
              case 'doc':
                return 'application/msword';
              case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              case 'xls':
                return 'application/vnd.ms-excel';
              case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              case 'txt':
                return 'text/plain';
              default:
                return type; // If it's already a mime type, use as is
            }
          })
          .flat();

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `File tidak valid. Hanya format ${allowedFileTypes.join(', ')} yang diizinkan.`,
            ),
            false,
          );
        }
      },
      storage: this.getStorage(path),

      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB default
      },
    };
  }
}
