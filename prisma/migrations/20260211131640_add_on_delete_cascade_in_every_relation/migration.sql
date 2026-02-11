-- DropForeignKey
ALTER TABLE `Announcement` DROP FOREIGN KEY `Announcement_institutionId_fkey`;

-- DropForeignKey
ALTER TABLE `Announcement` DROP FOREIGN KEY `Announcement_userId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentSubmission` DROP FOREIGN KEY `DocumentSubmission_letterDocumentId_fkey`;

-- DropForeignKey
ALTER TABLE `GeneralLetterSubmission` DROP FOREIGN KEY `GeneralLetterSubmission_institutionId_fkey`;

-- DropForeignKey
ALTER TABLE `GeneralLetterSubmission` DROP FOREIGN KEY `GeneralLetterSubmission_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `GeneralLetterSubmission` DROP FOREIGN KEY `GeneralLetterSubmission_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Letter` DROP FOREIGN KEY `Letter_institutionId_fkey`;

-- DropForeignKey
ALTER TABLE `Letter` DROP FOREIGN KEY `Letter_letterHeadId_fkey`;

-- DropForeignKey
ALTER TABLE `Letter` DROP FOREIGN KEY `Letter_userId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterAttribute` DROP FOREIGN KEY `LetterAttribute_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterAttributeSubmission` DROP FOREIGN KEY `LetterAttributeSubmission_generalLetterSubmissionId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterAttributeSubmission` DROP FOREIGN KEY `LetterAttributeSubmission_letterAttributeId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterAttributeSubmission` DROP FOREIGN KEY `LetterAttributeSubmission_studentLetterSubmissionId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterHead` DROP FOREIGN KEY `LetterHead_institutionId_fkey`;

-- DropForeignKey
ALTER TABLE `LetterHead` DROP FOREIGN KEY `LetterHead_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Nodes` DROP FOREIGN KEY `Nodes_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentLetterSubmission` DROP FOREIGN KEY `StudentLetterSubmission_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `StudentLetterSubmission` DROP FOREIGN KEY `StudentLetterSubmission_studentId_fkey`;

-- DropIndex
DROP INDEX `Announcement_institutionId_fkey` ON `Announcement`;

-- DropIndex
DROP INDEX `Announcement_userId_fkey` ON `Announcement`;

-- DropIndex
DROP INDEX `DocumentSubmission_letterDocumentId_fkey` ON `DocumentSubmission`;

-- DropIndex
DROP INDEX `GeneralLetterSubmission_institutionId_fkey` ON `GeneralLetterSubmission`;

-- DropIndex
DROP INDEX `GeneralLetterSubmission_letterId_fkey` ON `GeneralLetterSubmission`;

-- DropIndex
DROP INDEX `GeneralLetterSubmission_userId_fkey` ON `GeneralLetterSubmission`;

-- DropIndex
DROP INDEX `Letter_institutionId_fkey` ON `Letter`;

-- DropIndex
DROP INDEX `Letter_letterHeadId_fkey` ON `Letter`;

-- DropIndex
DROP INDEX `Letter_userId_fkey` ON `Letter`;

-- DropIndex
DROP INDEX `LetterAttribute_letterId_fkey` ON `LetterAttribute`;

-- DropIndex
DROP INDEX `LetterAttributeSubmission_generalLetterSubmissionId_fkey` ON `LetterAttributeSubmission`;

-- DropIndex
DROP INDEX `LetterAttributeSubmission_letterAttributeId_fkey` ON `LetterAttributeSubmission`;

-- DropIndex
DROP INDEX `LetterAttributeSubmission_studentLetterSubmissionId_fkey` ON `LetterAttributeSubmission`;

-- DropIndex
DROP INDEX `LetterHead_institutionId_fkey` ON `LetterHead`;

-- DropIndex
DROP INDEX `LetterHead_userId_fkey` ON `LetterHead`;

-- DropIndex
DROP INDEX `Nodes_parentId_fkey` ON `Nodes`;

-- DropIndex
DROP INDEX `StudentLetterSubmission_letterId_fkey` ON `StudentLetterSubmission`;

-- DropIndex
DROP INDEX `StudentLetterSubmission_studentId_fkey` ON `StudentLetterSubmission`;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_letterHeadId_fkey` FOREIGN KEY (`letterHeadId`) REFERENCES `LetterHead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentLetterSubmission` ADD CONSTRAINT `StudentLetterSubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentLetterSubmission` ADD CONSTRAINT `StudentLetterSubmission_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneralLetterSubmission` ADD CONSTRAINT `GeneralLetterSubmission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneralLetterSubmission` ADD CONSTRAINT `GeneralLetterSubmission_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GeneralLetterSubmission` ADD CONSTRAINT `GeneralLetterSubmission_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSubmission` ADD CONSTRAINT `DocumentSubmission_letterDocumentId_fkey` FOREIGN KEY (`letterDocumentId`) REFERENCES `LetterDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttribute` ADD CONSTRAINT `LetterAttribute_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `Letter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttributeSubmission` ADD CONSTRAINT `LetterAttributeSubmission_letterAttributeId_fkey` FOREIGN KEY (`letterAttributeId`) REFERENCES `LetterAttribute`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttributeSubmission` ADD CONSTRAINT `LetterAttributeSubmission_studentLetterSubmissionId_fkey` FOREIGN KEY (`studentLetterSubmissionId`) REFERENCES `StudentLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LetterAttributeSubmission` ADD CONSTRAINT `LetterAttributeSubmission_generalLetterSubmissionId_fkey` FOREIGN KEY (`generalLetterSubmissionId`) REFERENCES `GeneralLetterSubmission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nodes` ADD CONSTRAINT `Nodes_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
