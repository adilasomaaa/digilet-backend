-- DropForeignKey
ALTER TABLE `Personnel` DROP FOREIGN KEY `Personnel_studyProgramId_fkey`;

-- DropIndex
DROP INDEX `Personnel_studyProgramId_fkey` ON `Personnel`;

-- AlterTable
ALTER TABLE `Personnel` MODIFY `studyProgramId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Personnel` ADD CONSTRAINT `Personnel_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
