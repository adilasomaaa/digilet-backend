-- DropForeignKey
ALTER TABLE `Personnel` DROP FOREIGN KEY `Personnel_userId_fkey`;

-- DropIndex
DROP INDEX `Personnel_userId_fkey` ON `Personnel`;

-- AddForeignKey
ALTER TABLE `Personnel` ADD CONSTRAINT `Personnel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
