/*
  Warnings:

  - You are about to drop the column `studyProgramId` on the `LetterHead` table. All the data in the column will be lost.
  - You are about to drop the column `studyProgramId` on the `Official` table. All the data in the column will be lost.
  - You are about to drop the column `studyProgramId` on the `Personnel` table. All the data in the column will be lost.
  - You are about to drop the column `studyProgramId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `StudyProgram` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `institutionId` to the `Letter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Letter` DROP FOREIGN KEY `Letter_userId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterHead` DROP FOREIGN KEY `LetterHead_studyProgramId_fkey`;

-- DropForeignKey
ALTER TABLE `Official` DROP FOREIGN KEY `Official_studyProgramId_fkey`;

-- DropForeignKey
ALTER TABLE `Personnel` DROP FOREIGN KEY `Personnel_studyProgramId_fkey`;

-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_studyProgramId_fkey`;

-- DropIndex
DROP INDEX `Letter_userId_fkey` ON `Letter`;

-- DropIndex
DROP INDEX `LetterHead_studyProgramId_fkey` ON `LetterHead`;

-- DropIndex
DROP INDEX `Official_studyProgramId_fkey` ON `Official`;

-- DropIndex
DROP INDEX `Personnel_studyProgramId_fkey` ON `Personnel`;

-- DropIndex
DROP INDEX `Student_studyProgramId_fkey` ON `Student`;

-- AlterTable
ALTER TABLE `Letter` ADD COLUMN `institutionId` INTEGER NOT NULL,
    MODIFY `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `LetterHead` DROP COLUMN `studyProgramId`,
    ADD COLUMN `institutionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Official` DROP COLUMN `studyProgramId`,
    ADD COLUMN `institutionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Personnel` DROP COLUMN `studyProgramId`,
    ADD COLUMN `institutionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `studyProgramId`,
    ADD COLUMN `institutionId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `StudyProgram`;

-- CreateTable
CREATE TABLE `Institution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `type` ENUM('university', 'faculty', 'study_program', 'institution') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Institution_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Personnel` ADD CONSTRAINT `Personnel_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Official` ADD CONSTRAINT `Official_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
