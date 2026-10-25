-- Tracks how many times the delivery job has failed to email a scheduled
-- notification. After 3 failed attempts (one per daily job run) the job
-- gives up on email and marks it sent anyway, so the recipient at least
-- sees it in the bell.

ALTER TABLE "core"."notifications" ADD COLUMN "delivery_attempts" INTEGER NOT NULL DEFAULT 0;
