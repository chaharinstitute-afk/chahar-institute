-- CreateTable
CREATE TABLE `business_partner_leads` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(150) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NULL,
    `city` VARCHAR(100) NULL,
    `message` TEXT NULL,
    `status` ENUM('new', 'contacted', 'converted', 'closed') NOT NULL DEFAULT 'new',
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
