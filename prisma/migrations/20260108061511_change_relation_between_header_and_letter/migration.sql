/*
  Warnings:

  - You are about to drop the column `headerId` on the `LetterHead` table. All the data in the column will be lost.
  - You are about to drop the column `letterId` on the `LetterHead` table. All the data in the column will be lost.
  - You are about to drop the `Header` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `LetterHead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `header` to the `LetterHead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `LetterHead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `LetterHead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subheader` to the `LetterHead` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Header` DROP FOREIGN KEY `Header_studyProgramId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterHead` DROP FOREIGN KEY `LetterHead_headerId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterHead` DROP FOREIGN KEY `LetterHead_letterId_fkey`;

-- DropIndex
DROP INDEX `LetterHead_headerId_fkey` ON `LetterHead`;

-- DropIndex
DROP INDEX `LetterHead_letterId_fkey` ON `LetterHead`;

-- AlterTable
ALTER TABLE `Letter` ADD COLUMN `letterHeadId` INTEGER NULL;

-- AlterTable
ALTER TABLE `LetterHead` DROP COLUMN `headerId`,
    DROP COLUMN `letterId`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `header` VARCHAR(191) NOT NULL,
    ADD COLUMN `logo` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `studyProgramId` INTEGER NULL,
    ADD COLUMN `subheader` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Header`;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_letterHeadId_fkey` FOREIGN KEY (`letterHeadId`) REFERENCES `LetterHead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
