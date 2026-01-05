/*
  Warnings:

  - You are about to drop the column `class_year` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Student` table. All the data in the column will be lost.
  - Added the required column `classYear` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Student` DROP COLUMN `class_year`,
    DROP COLUMN `phone_number`,
    ADD COLUMN `classYear` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL;
