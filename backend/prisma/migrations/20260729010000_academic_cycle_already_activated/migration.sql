-- Tracks whether a cycle has ever been activated (status -> "active" for
-- the first time), the moment the wallet catalog is locked in and copied
-- to every already-enrolled student. Manual enrollments only snapshot the
-- wallet catalog once this is true — before the cycle's first activation,
-- the catalog isn't considered final yet.

ALTER TABLE "core"."academic_cycles" ADD COLUMN "already_activated" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: any cycle that isn't "upcoming" has necessarily been active at
-- some point already (upcoming is the only status that precedes the first
-- activation), so it's considered already activated.
UPDATE "core"."academic_cycles" SET "already_activated" = true WHERE "status" != 'upcoming';
