-- Notifications gain a recipient_type discriminator ("admin" | "student")
-- so GET /notifications/{type}/{id} can filter correctly once the
-- not-yet-built student-facing app shares this same table. Every existing
-- row is an employee notification, so the default backfills them as
-- "admin" automatically.

CREATE TYPE "core"."NotificationRecipientType" AS ENUM ('admin', 'student');

ALTER TABLE "core"."notifications"
  ADD COLUMN "recipient_type" "core"."NotificationRecipientType" NOT NULL DEFAULT 'admin';
