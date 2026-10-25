-- Internal control code for payment concepts: max 10 chars, unique.
-- Added nullable first so existing rows can be backfilled before the
-- NOT NULL + unique constraints are enforced.
ALTER TABLE core.payment_concepts ADD COLUMN "code" VARCHAR(10);

-- Backfill existing rows with a unique placeholder derived from their id.
-- Real payment concepts get a proper code via prisma/seed.ts upserts;
-- this only guards against pre-existing rows this migration doesn't know about.
UPDATE core.payment_concepts
SET "code" = UPPER(LEFT(REPLACE(id::text, '-', ''), 10))
WHERE "code" IS NULL;

ALTER TABLE core.payment_concepts ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "payment_concepts_code_key" ON core.payment_concepts("code");
