/*
  Warnings:

  - You are about to drop the column `signatureType` on the `Letter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `GeneralLetterSubmission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `StudentLetterSubmission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `signatureType` to the `GeneralLetterSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `GeneralLetterSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatureType` to the `StudentLetterSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `StudentLetterSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `GeneralLetterSubmission` ADD COLUMN `signatureType` ENUM('digital', 'barcode') NOT NULL,
    ADD COLUMN `token` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Letter` DROP COLUMN `signatureType`;

-- AlterTable
ALTER TABLE `StudentLetterSubmission` ADD COLUMN `signatureType` ENUM('digital', 'barcode') NOT NULL,
    ADD COLUMN `token` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `GeneralLetterSubmission_token_key` ON `GeneralLetterSubmission`(`token`);

-- CreateIndex
CREATE UNIQUE INDEX `StudentLetterSubmission_token_key` ON `StudentLetterSubmission`(`token`);
