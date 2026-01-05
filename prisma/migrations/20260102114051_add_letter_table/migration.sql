-- CreateTable
CREATE TABLE `Letter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `letterName` VARCHAR(191) NOT NULL,
    `referenceNumber` VARCHAR(191) NOT NULL,
    `expiredDate` VARCHAR(191) NOT NULL,
    `letterNumberingStart` VARCHAR(191) NOT NULL,
    `category` ENUM('fakultas', 'jurusan', 'universitas', 'all') NOT NULL,
    `signatureType` ENUM('digital', 'barcode') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Letter` ADD CONSTRAINT `Letter_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
