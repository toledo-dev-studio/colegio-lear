-- Notifications can now be created ahead of when they should actually
-- become visible/delivered — specifically, an announcement's recipient
-- notifications are registered (rows created, recipientsCount updated)
-- the moment it's published, but only actually released (shown in the
-- bell, email sent) once the campaign's publishedAt is reached. A
-- scheduled job releases anything due.
--
-- Every existing notification keeps working unchanged: both new columns
-- default to "already deliverable" (scheduled_for = now, sent = true),
-- so only the announcement dispatch path explicitly sets sent = false
-- for a future publishedAt.

ALTER TABLE "core"."notifications" ADD COLUMN "scheduled_for" TIMESTAMP(3) NOT NULL DEFAULT now();
ALTER TABLE "core"."notifications" ADD COLUMN "sent" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "notifications_sent_scheduled_for_idx" ON "core"."notifications"("sent", "scheduled_for");
