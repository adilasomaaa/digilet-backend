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
}
