-- Rename column status → is_active in announcements table
ALTER TABLE core.announcements RENAME COLUMN status TO is_active;
