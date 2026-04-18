-- AlterTable
ALTER TABLE `LetterHead` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `LetterHead` ADD CONSTRAINT `LetterHead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
