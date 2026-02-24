-- CreateTable
CREATE TABLE `ReportingPeriodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `targetUser` ENUM('student', 'lecturer') NOT NULL,
    `scope` ENUM('faculty', 'study_program') NOT NULL,
    `institutionId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportingStages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportingPeriodeId` INTEGER NOT NULL,
    `stageName` VARCHAR(191) NOT NULL,
    `stageOrder` INTEGER NOT NULL DEFAULT 1,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportingStageId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `officialId` INTEGER NOT NULL,
    `content` LONGTEXT NOT NULL,
    `documentProved` VARCHAR(191) NULL,
    `notes` LONGTEXT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LecturerReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportingStageId` INTEGER NOT NULL,
    `reporterId` INTEGER NOT NULL,
    `validatorId` INTEGER NOT NULL,
    `content` LONGTEXT NOT NULL,
    `documentProved` VARCHAR(191) NULL,
    `notes` LONGTEXT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReportingPeriodes` ADD CONSTRAINT `ReportingPeriodes_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportingPeriodes` ADD CONSTRAINT `ReportingPeriodes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportingStages` ADD CONSTRAINT `ReportingStages_reportingPeriodeId_fkey` FOREIGN KEY (`reportingPeriodeId`) REFERENCES `ReportingPeriodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentReport` ADD CONSTRAINT `StudentReport_reportingStageId_fkey` FOREIGN KEY (`reportingStageId`) REFERENCES `ReportingStages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentReport` ADD CONSTRAINT `StudentReport_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentReport` ADD CONSTRAINT `StudentReport_officialId_fkey` FOREIGN KEY (`officialId`) REFERENCES `Official`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LecturerReport` ADD CONSTRAINT `LecturerReport_reportingStageId_fkey` FOREIGN KEY (`reportingStageId`) REFERENCES `ReportingStages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LecturerReport` ADD CONSTRAINT `LecturerReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `Official`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LecturerReport` ADD CONSTRAINT `LecturerReport_validatorId_fkey` FOREIGN KEY (`validatorId`) REFERENCES `Official`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
