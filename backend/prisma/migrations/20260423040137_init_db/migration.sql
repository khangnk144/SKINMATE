-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `skinType` ENUM('OILY', 'DRY', 'SENSITIVE', 'COMBINATION', 'NORMAL') NULL DEFAULT 'NORMAL',
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ingredient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `Ingredient_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IngredientRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ingredientId` INTEGER NOT NULL,
    `skinType` ENUM('OILY', 'DRY', 'SENSITIVE', 'COMBINATION', 'NORMAL') NOT NULL,
    `effect` ENUM('GOOD', 'BAD', 'NEUTRAL') NOT NULL DEFAULT 'NEUTRAL',

    UNIQUE INDEX `IngredientRule_ingredientId_skinType_key`(`ingredientId`, `skinType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductIngredient` (
    `productId` VARCHAR(191) NOT NULL,
    `ingredientId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,

    PRIMARY KEY (`productId`, `ingredientId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalysisHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rawInput` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IngredientRule` ADD CONSTRAINT `IngredientRule_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductIngredient` ADD CONSTRAINT `ProductIngredient_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductIngredient` ADD CONSTRAINT `ProductIngredient_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalysisHistory` ADD CONSTRAINT `AnalysisHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
