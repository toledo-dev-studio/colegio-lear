import { prisma } from "../lib/prisma";
import { mailService } from "../services/mail.service";
import { logger } from "../lib/logger";
import { NotificationService } from "../../modules/notifications/notification.service";

/**
 * One-shot entry point for the notification delivery job, meant for a
 * Render Cron Job (command: `node dist/shared/jobs/run-notification-delivery.js`).
 * Releases due notifications once and exits — non-zero on failure so Render
 * marks the run as failed. Same work as the in-process node-cron schedule in
 * notification-delivery.job.ts, which must be disabled (ENABLE_IN_PROCESS_JOBS=false)
 * on the web service so both never run at once.
 */
async function main(): Promise<void> {
  const notificationService = new NotificationService(prisma, mailService);
  let exitCode = 0;

  try {
    await notificationService.releaseDueNotifications();
    console.log("Notification delivery job finished");
  } catch (error) {
    exitCode = 1;
    logger.error("Notification delivery job failed", { error });
    console.error("Notification delivery job failed", error);
  } finally {
    await prisma.$disconnect();
  }

  // Exit explicitly: the pg pool behind the Prisma adapter can keep the
  // event loop alive after $disconnect.
  process.exit(exitCode);
}

void main();
