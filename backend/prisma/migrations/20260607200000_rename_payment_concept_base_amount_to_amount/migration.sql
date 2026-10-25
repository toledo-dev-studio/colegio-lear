-- Rename column base_amount → amount in payment_concepts table
ALTER TABLE core.payment_concepts RENAME COLUMN base_amount TO amount;
