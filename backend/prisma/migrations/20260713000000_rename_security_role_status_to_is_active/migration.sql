-- Rename column status → is_active in security_roles table
ALTER TABLE core.security_roles RENAME COLUMN status TO is_active;
