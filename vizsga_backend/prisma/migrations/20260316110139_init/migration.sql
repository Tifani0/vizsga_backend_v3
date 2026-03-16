-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phonenumber` VARCHAR(191) NOT NULL,
    `role` ENUM('PROVIDER', 'CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `profession` ENUM('Kozmetikus', 'Fodrász', 'Műkörmös') NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AvailableSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AvailableSlot_providerId_date_time_key`(`providerId`, `date`, `time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `status` ENUM('confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'confirmed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlot` ADD CONSTRAINT `AvailableSlot_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
