import {
  Injectable,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  FileValidator,
  PipeTransform,
  BadRequestException,
  FileTypeValidatorOptions,
} from '@nestjs/common';

export interface PhotoValidationOptions {
  fileIsRequired?: boolean;
  maxSize?: number;
  fileType?: RegExp;
  message?: string;
}

interface CustomFileTypeValidatorOptions extends FileTypeValidatorOptions {
  message?: string;
}

@Injectable()
export class ValidationPipe extends ParseFilePipe implements PipeTransform {
  constructor(protected readonly options: PhotoValidationOptions = {}) {
    const { fileIsRequired = true, maxSize, fileType, message } = options;
    const validators: FileValidator[] = [];

    if (maxSize) {
      validators.push(
        new MaxFileSizeValidator({
          maxSize,
          message: `Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB.`, // Pesan default yang lebih baik
        }),
      );
    }

    if (fileType) {
      validators.push(
        new FileTypeValidator({
          fileType,
          message: `Tipe file tidak valid. Tipe yang diizinkan: ${fileType}.`,
        } as CustomFileTypeValidatorOptions),
      );
    }

    super({
      validators,
      fileIsRequired,
      exceptionFactory: (error) => {
        const errorMessage = message || error || 'File tidak valid.';
        throw new BadRequestException(errorMessage);
      },
    });
  }
}
