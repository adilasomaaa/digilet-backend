-- CreateTable
CREATE TABLE `LetterAttribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `letterId` INTEGER NOT NULL,
    `attributeName` VARCHAR(191) NOT NULL,
    `placeholder` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `isEditable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LetterAttributeSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `letterAttributeId` INTEGER NOT NULL,
    `studentLetterSubmissionId` INTEGER NULL,
    `generalLetterSubmissionId` INTEGER NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LetterAttribute` ADD CONSTRAINT `LetterAttribute_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttributeSubmission` ADD CONSTRAINT `LetterAttributeSubmission_letterAttributeId_fkey` FOREIGN KEY (`letterAttributeId`) REFERENCES `LetterAttribute`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttributeSubmission` ADD CONSTRAINT `LetterAttributeSubmission_studentLetterSubmissionId_fkey` FOREIGN KEY (`studentLetterSubmissionId`) REFERENCES `StudentLetterSubmission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttributeSubmission` ADD CONSTRAINT `LetterAttributeSubmission_generalLetterSubmissionId_fkey` FOREIGN KEY (`generalLetterSubmissionId`) REFERENCES `GeneralLetterSubmission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
