-- Announcements move from a simple is_active on/off flag to a real
-- lifecycle (draft -> in-progress -> completed/cancelled), plus
-- already_published to track whether recipients were ever resolved for it
-- (that resolution now happens on the first transition to "in-progress",
-- not at creation time).

CREATE TYPE "core"."AnnouncementStatus" AS ENUM ('draft', 'in-progress', 'completed', 'cancelled');

-- 1) Add the new columns (status nullable for now, to allow backfill).
ALTER TABLE "core"."announcements" ADD COLUMN "status" "core"."AnnouncementStatus";
ALTER TABLE "core"."announcements" ADD COLUMN "already_published" BOOLEAN NOT NULL DEFAULT false;

-- 2) Backfill: every existing row was already dispatched at creation time
-- under the old always-notify-on-create behavior, so it's considered
-- already published. is_active=true maps to "in-progress" (currently
-- running); is_active=false maps to "completed" (there's no way to tell
-- "explicitly cancelled" apart from the old boolean).
UPDATE "core"."announcements" SET
  "status" = CASE WHEN "is_active" THEN 'in-progress'::"core"."AnnouncementStatus" ELSE 'completed'::"core"."AnnouncementStatus" END,
  "already_published" = true;

-- 3) Enforce NOT NULL + set the default now that every row has a value.
ALTER TABLE "core"."announcements" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "core"."announcements" ALTER COLUMN "status" SET DEFAULT 'draft';

-- 4) Drop the old column.
ALTER TABLE "core"."announcements" DROP COLUMN "is_active";
