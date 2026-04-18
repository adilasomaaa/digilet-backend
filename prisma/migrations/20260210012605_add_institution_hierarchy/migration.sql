-- AlterTable
ALTER TABLE `Institution` ADD COLUMN `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Institution` ADD CONSTRAINT `Institution_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
