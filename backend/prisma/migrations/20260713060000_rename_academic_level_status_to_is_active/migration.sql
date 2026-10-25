-- Rename column status → is_active in academic_levels table
ALTER TABLE core.academic_levels RENAME COLUMN status TO is_active;
