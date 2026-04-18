/*
  Warnings:

  - The values [fakultas,jurusan,universitas] on the enum `Letter_category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Letter` MODIFY `category` ENUM('faculty', 'study_program', 'university', 'all') NOT NULL;

-- CreateTable
CREATE TABLE `Header` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studyProgramId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `header` VARCHAR(191) NOT NULL,
    `subheader` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LetterHead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `headerId` INTEGER NOT NULL,
    `letterId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LetterTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `letterId` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LetterSignatureTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `letterId` INTEGER NOT NULL,
    `officialId` INTEGER NOT NULL,
    `position` VARCHAR(191) NOT NULL DEFAULT 'right',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentLetterSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `letterId` INTEGER NOT NULL,
    `letterNumber` VARCHAR(191) NULL,
    `status` ENUM('pending', 'waiting_signature', 'approved', 'rejected') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GeneralLetterSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `letterId` INTEGER NOT NULL,
    `letterNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LetterSignature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentLetterSubmissionId` INTEGER NOT NULL,
    `generalLetterSubmissionId` INTEGER NOT NULL,
    `letterSignatureTemplateId` INTEGER NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letterDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `letterId` INTEGER NOT NULL,
    `docuentName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL DEFAULT 'pdf',
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentLetterSubmissionId` INTEGER NOT NULL,
    `letterDocumentId` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Header` ADD CONSTRAINT `Header_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_headerId_fkey` FOREIGN KEY (`headerId`) REFERENCES `Header`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterTemplate` ADD CONSTRAINT `LetterTemplate_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterSignatureTemplate` ADD CONSTRAINT `LetterSignatureTemplate_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterSignatureTemplate` ADD CONSTRAINT `LetterSignatureTemplate_officialId_fkey` FOREIGN KEY (`officialId`) REFERENCES `Official`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentLetterSubmission` ADD CONSTRAINT `StudentLetterSubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentLetterSubmission` ADD CONSTRAINT `StudentLetterSubmission_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneralLetterSubmission` ADD CONSTRAINT `GeneralLetterSubmission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneralLetterSubmission` ADD CONSTRAINT `GeneralLetterSubmission_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterSignature` ADD CONSTRAINT `LetterSignature_studentLetterSubmissionId_fkey` FOREIGN KEY (`studentLetterSubmissionId`) REFERENCES `StudentLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterSignature` ADD CONSTRAINT `LetterSignature_generalLetterSubmissionId_fkey` FOREIGN KEY (`generalLetterSubmissionId`) REFERENCES `GeneralLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterSignature` ADD CONSTRAINT `LetterSignature_letterSignatureTemplateId_fkey` FOREIGN KEY (`letterSignatureTemplateId`) REFERENCES `LetterSignatureTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letterDocument` ADD CONSTRAINT `letterDocument_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSubmission` ADD CONSTRAINT `DocumentSubmission_studentLetterSubmissionId_fkey` FOREIGN KEY (`studentLetterSubmissionId`) REFERENCES `StudentLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSubmission` ADD CONSTRAINT `DocumentSubmission_letterDocumentId_fkey` FOREIGN KEY (`letterDocumentId`) REFERENCES `letterDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
