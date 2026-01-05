/*
  Warnings:

  - You are about to drop the column `docuentName` on the `letterDocument` table. All the data in the column will be lost.
  - Added the required column `documentName` to the `letterDocument` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Header` DROP FOREIGN KEY `Header_studyProgramId_fkey`;

-- DropIndex
DROP INDEX `Header_studyProgramId_fkey` ON `Header`;

-- AlterTable
ALTER TABLE `Header` MODIFY `studyProgramId` INTEGER NULL;

-- AlterTable
ALTER TABLE `LetterSignature` MODIFY `studentLetterSubmissionId` INTEGER NULL,
    MODIFY `generalLetterSubmissionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `letterDocument` DROP COLUMN `docuentName`,
    ADD COLUMN `documentName` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Header` ADD CONSTRAINT `Header_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
