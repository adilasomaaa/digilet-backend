/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Official` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Official` ADD COLUMN `userId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Official_userId_key` ON `Official`(`userId`);

-- AddForeignKey
ALTER TABLE `Official` ADD CONSTRAINT `Official_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
