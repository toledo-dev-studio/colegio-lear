-- Rename column status → is_active in school_subjects table
ALTER TABLE core.school_subjects RENAME COLUMN status TO is_active;
