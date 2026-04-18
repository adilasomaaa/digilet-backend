-- AlterTable
ALTER TABLE `GeneralLetterSubmission` ADD COLUMN `letterDate` DATETIME(3) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `StudentLetterSubmission` ADD COLUMN `letterDate` DATETIME(3) NULL;
