-- AlterTable
ALTER TABLE `Letter` MODIFY `referenceNumber` VARCHAR(191) NULL,
    MODIFY `expiredDate` INTEGER NULL,
    MODIFY `letterNumberingStart` INTEGER NULL;

-- AlterTable
ALTER TABLE `LetterSignatureTemplate` ADD COLUMN `isAcknowledged` BOOLEAN NOT NULL DEFAULT false;
