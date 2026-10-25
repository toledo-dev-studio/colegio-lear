-- Calculated view-tracking history for announcements. Maintained by a
-- future cron job (not by the CRUD endpoints) so the aggregate survives
-- even if per-recipient notification rows are later deleted.
ALTER TABLE core.announcements ADD COLUMN "recipients_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE core.announcements ADD COLUMN "viewed_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE core.announcements ADD COLUMN "views_calculated_at" TIMESTAMP(3);
