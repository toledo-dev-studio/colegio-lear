-- Rename column status → is_active in employees table
ALTER TABLE core.employees RENAME COLUMN status TO is_active;
