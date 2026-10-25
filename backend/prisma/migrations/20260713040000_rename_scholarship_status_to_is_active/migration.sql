-- Rename column status → is_active in scholarships table
ALTER TABLE core.scholarships RENAME COLUMN status TO is_active;
