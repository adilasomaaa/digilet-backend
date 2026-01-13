/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Personnel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Personnel_userId_key` ON `Personnel`(`userId`);
