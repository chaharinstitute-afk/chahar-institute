-- AlterTable
ALTER TABLE `courses` ADD COLUMN `career_opportunities` JSON NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `faqs` JSON NULL,
    ADD COLUMN `overview` TEXT NULL,
    ADD COLUMN `required_documents` JSON NULL;
