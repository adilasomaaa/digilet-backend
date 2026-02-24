/*
  Warnings:

  - A unique constraint covering the columns `[nip]` on the table `Official` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Official_nip_key` ON `Official`(`nip`);
