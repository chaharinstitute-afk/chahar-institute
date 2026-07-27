-- AlterTable
ALTER TABLE `admissions` ADD COLUMN `current_payment_status` ENUM('pending_verification', 'partially_paid', 'paid', 'rejected') NULL,
    ADD COLUMN `due_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `last_payment_date` DATETIME(3) NULL,
    ADD COLUMN `next_payment_due_date` DATE NULL,
    ADD COLUMN `received_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `total_fee` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` ENUM('upi', 'bank_transfer') NOT NULL DEFAULT 'upi',
    `label` VARCHAR(100) NOT NULL,
    `upi_id` VARCHAR(100) NULL,
    `upi_number` VARCHAR(20) NULL,
    `qr_code_image` VARCHAR(255) NULL,
    `bank_name` VARCHAR(150) NULL,
    `account_number` VARCHAR(50) NULL,
    `ifsc_code` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_submissions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `admission_id` BIGINT NOT NULL,
    `payment_method_id` BIGINT NULL,
    `amount_paid` DECIMAL(10, 2) NOT NULL,
    `utr_number` VARCHAR(100) NULL,
    `screenshot_path` VARCHAR(255) NOT NULL,
    `submitted_by` BIGINT NOT NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('pending_verification', 'approved', 'rejected') NOT NULL DEFAULT 'pending_verification',
    `verified_by` BIGINT NULL,
    `verified_at` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `total_fee_at_decision` DECIMAL(10, 2) NULL,
    `received_amount_at_decision` DECIMAL(10, 2) NULL,
    `due_amount_at_decision` DECIMAL(10, 2) NULL,
    `next_due_date_set` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_admission_id_fkey` FOREIGN KEY (`admission_id`) REFERENCES `admissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_submissions` ADD CONSTRAINT `payment_submissions_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
