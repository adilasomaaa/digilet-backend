/*
  Warnings:

  - You are about to drop the `letterDocument` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DocumentSubmission` DROP FOREIGN KEY `DocumentSubmission_letterDocumentId_fkey`;

-- DropForeignKey
ALTER TABLE `letterDocument` DROP FOREIGN KEY `letterDocument_letterId_fkey`;

-- DropIndex
DROP INDEX `DocumentSubmission_letterDocumentId_fkey` ON `DocumentSubmission`;

-- DropTable
DROP TABLE `letterDocument`;

-- CreateTable
CREATE TABLE `LetterDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `letterId` INTEGER NOT NULL,
    `documentName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL DEFAULT 'pdf',
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LetterDocument` ADD CONSTRAINT `LetterDocument_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSubmission` ADD CONSTRAINT `DocumentSubmission_letterDocumentId_fkey` FOREIGN KEY (`letterDocumentId`) REFERENCES `LetterDocument`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
