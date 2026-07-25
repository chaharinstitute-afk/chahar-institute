-- CreateTable
CREATE TABLE `testimonials` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `course` VARCHAR(150) NOT NULL,
    `review` TEXT NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
