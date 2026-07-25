/*
  Warnings:

  - Made the column `session_type` on table `admission_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill existing NULL session_type rows (seeded before "Annual" sentinel was introduced)
UPDATE `admission_sessions` SET `session_type` = 'Annual' WHERE `session_type` IS NULL;

-- AlterTable
ALTER TABLE `admission_sessions` MODIFY `session_type` VARCHAR(20) NOT NULL DEFAULT 'Annual';
