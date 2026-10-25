-- Needed to order/list "most recently registered employees" for the
-- dashboard. Existing rows get the migration-run timestamp as a
-- reasonable default (no prior creation timestamp exists to backfill from).
ALTER TABLE core.employees ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
