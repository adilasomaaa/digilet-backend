-- AlterTable
ALTER TABLE `GeneralLetterSubmission` ADD COLUMN `carbonCopy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `StudentLetterSubmission` ADD COLUMN `carbonCopy` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `LetterAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentLetterSubmissionId` INTEGER NULL,
    `generalLetterSubmissionId` INTEGER NULL,
    `content` LONGTEXT NOT NULL,
    `isVisible` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LetterAttachment` ADD CONSTRAINT `LetterAttachment_studentLetterSubmissionId_fkey` FOREIGN KEY (`studentLetterSubmissionId`) REFERENCES `StudentLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttachment` ADD CONSTRAINT `LetterAttachment_generalLetterSubmissionId_fkey` FOREIGN KEY (`generalLetterSubmissionId`) REFERENCES `GeneralLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
