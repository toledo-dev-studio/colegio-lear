-- Rename column status → is_active in job_titles table
ALTER TABLE core.job_titles RENAME COLUMN status TO is_active;
