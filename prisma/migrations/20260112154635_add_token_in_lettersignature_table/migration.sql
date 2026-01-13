/*
  Warnings:

  - Added the required column `token` to the `LetterSignature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LetterSignature` ADD COLUMN `token` VARCHAR(191) NOT NULL,
    MODIFY `signature` VARCHAR(191) NULL;
