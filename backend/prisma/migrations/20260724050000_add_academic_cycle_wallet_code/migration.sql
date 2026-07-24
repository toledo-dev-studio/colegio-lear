-- Internal control code for academic cycle wallet items: max 10 chars,
-- unique per academic cycle (the same code may repeat across different
-- cycles, since each cycle has its own independent wallet catalog).
ALTER TABLE core.academic_cycle_wallet ADD COLUMN "code" VARCHAR(10);

-- Backfill any pre-existing rows with a unique-enough placeholder derived
-- from their id (real entries get a proper code from the frontend going
-- forward, this only guards data created before this migration).
UPDATE core.academic_cycle_wallet
SET "code" = UPPER(LEFT(REPLACE(id::text, '-', ''), 10))
WHERE "code" IS NULL;

ALTER TABLE core.academic_cycle_wallet ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "academic_cycle_wallet_academic_cycle_id_code_key" ON core.academic_cycle_wallet("academic_cycle_id", "code");
