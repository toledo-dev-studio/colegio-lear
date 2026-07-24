-- Snapshot of the wallet catalog entry's code, copied at enrollment time
-- (same pattern already used for name/description/amount on this table).
ALTER TABLE core.student_wallet_items ADD COLUMN "code" VARCHAR(10);

-- Backfill existing rows from their source wallet catalog entry.
UPDATE core.student_wallet_items swi
SET "code" = acw."code"
FROM core.academic_cycle_wallet acw
WHERE swi.academic_cycle_wallet_id = acw.id AND swi."code" IS NULL;

-- Fallback placeholder for any row whose source wallet entry is gone.
UPDATE core.student_wallet_items
SET "code" = UPPER(LEFT(REPLACE(id::text, '-', ''), 10))
WHERE "code" IS NULL;

ALTER TABLE core.student_wallet_items ALTER COLUMN "code" SET NOT NULL;
