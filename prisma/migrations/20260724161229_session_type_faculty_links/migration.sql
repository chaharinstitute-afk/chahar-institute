/*
  Warnings:

  - A unique constraint covering the columns `[session,session_type]` on the table `admission_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `admission_sessions_session_key` ON `admission_sessions`;

-- AlterTable
ALTER TABLE `admission_sessions` ADD COLUMN `session_type` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `courses` ADD COLUMN `faculty_id` BIGINT NULL;

-- AlterTable
ALTER TABLE `streams` ADD COLUMN `faculty_id` BIGINT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `admission_sessions_session_session_type_key` ON `admission_sessions`(`session`, `session_type`);

-- AddForeignKey
ALTER TABLE `streams` ADD CONSTRAINT `streams_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
