/*
  Warnings:

  - Added the required column `userId` to the `Letter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `LetterHead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Letter` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `LetterHead` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
