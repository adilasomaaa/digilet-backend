/*
  Warnings:

  - You are about to drop the column `userId` on the `Letter` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LetterHead` table. All the data in the column will be lost.
  - Added the required column `institutionId` to the `GeneralLetterSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Letter` DROP FOREIGN KEY `Letter_userId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterHead` DROP FOREIGN KEY `LetterHead_userId_fkey`;

-- DropIndex
DROP INDEX `Letter_userId_fkey` ON `Letter`;

-- DropIndex
DROP INDEX `LetterHead_userId_fkey` ON `LetterHead`;

-- AlterTable
ALTER TABLE `GeneralLetterSubmission` ADD COLUMN `institutionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Letter` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `LetterHead` DROP COLUMN `userId`;

-- AddForeignKey
ALTER TABLE `GeneralLetterSubmission` ADD CONSTRAINT `GeneralLetterSubmission_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
