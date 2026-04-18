/*
  Warnings:

  - You are about to alter the column `expiredDate` on the `Letter` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `letterNumberingStart` on the `Letter` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Letter` MODIFY `expiredDate` INTEGER NOT NULL,
    MODIFY `letterNumberingStart` INTEGER NOT NULL;
