-- Rename `yearly_fee` to `university_fee` (preserves existing data — this is
-- a column rename, not a drop+recreate) and add `total_admin_fee` as a new
-- nullable column for Chahar Institute's admission handling charge.
ALTER TABLE `courses` RENAME COLUMN `yearly_fee` TO `university_fee`;
ALTER TABLE `courses` ADD COLUMN `total_admin_fee` DECIMAL(10, 2) NULL;
