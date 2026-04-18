/*
  Warnings:

  - You are about to drop the column `letterSignatureTemplateId` on the `LetterSignature` table. All the data in the column will be lost.
  - You are about to drop the `LetterSignatureTemplate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `officialId` to the `LetterSignature` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `LetterSignature` DROP FOREIGN KEY `LetterSignature_letterSignatureTemplateId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterSignatureTemplate` DROP FOREIGN KEY `LetterSignatureTemplate_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterSignatureTemplate` DROP FOREIGN KEY `LetterSignatureTemplate_officialId_fkey`;

-- DropIndex
DROP INDEX `LetterSignature_letterSignatureTemplateId_fkey` ON `LetterSignature`;

-- AlterTable
ALTER TABLE `GeneralLetterSubmission` MODIFY `carbonCopy` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `LetterSignature` DROP COLUMN `letterSignatureTemplateId`,
    ADD COLUMN `isAcknowledged` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `officialId` INTEGER NOT NULL,
    ADD COLUMN `position` VARCHAR(191) NOT NULL DEFAULT 'right';

-- AlterTable
ALTER TABLE `StudentLetterSubmission` MODIFY `carbonCopy` LONGTEXT NULL;

-- DropTable
DROP TABLE `LetterSignatureTemplate`;

-- AddForeignKey
ALTER TABLE `LetterSignature` ADD CONSTRAINT `LetterSignature_officialId_fkey` FOREIGN KEY (`officialId`) REFERENCES `Official`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
