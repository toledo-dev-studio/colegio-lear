-- Rename column status → is_active in payment_concepts table
ALTER TABLE core.payment_concepts RENAME COLUMN status TO is_active;
