/*
  Warnings:

  - You are about to drop the column `filePath` on the `letterDocument` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `LetterTemplate` MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `letterDocument` DROP COLUMN `filePath`,
    ADD COLUMN `fileType` VARCHAR(191) NOT NULL DEFAULT 'pdf';
