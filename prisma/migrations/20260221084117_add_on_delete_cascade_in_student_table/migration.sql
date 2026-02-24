-- DropForeignKey
ALTER TABLE `ActiveToken` DROP FOREIGN KEY `ActiveToken_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Student` DROP FOREIGN KEY `Student_institutionId_fkey`;

-- DropIndex
DROP INDEX `ActiveToken_userId_fkey` ON `ActiveToken`;

-- DropIndex
DROP INDEX `Student_institutionId_fkey` ON `Student`;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActiveToken` ADD CONSTRAINT `ActiveToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
