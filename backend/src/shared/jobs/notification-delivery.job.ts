import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { mailService } from "../services/mail.service";
import { logger } from "../lib/logger";
import { NotificationService } from "../../modules/notifications/notification.service";

const notificationService = new NotificationService(prisma, mailService);

/**
 * Releases due notifications (sent:false, scheduledFor <= now) once a
 * day at 6am — today this only ever means an announcement whose
 * publishedAt has arrived (see
 * NotificationService.notifyAnnouncementPublished /
 * releaseDueNotifications). A single daily pass naturally catches up on
 * anything still due from previous days (e.g. yesterday's failed
 * attempts) along with today's newly-due notifications. Runs once
 * immediately on startup too, so anything already due doesn't sit
 * waiting for the next 6am tick.
 *
 * In-process scheduling only — disabled on Render (ENABLE_IN_PROCESS_JOBS=false),
 * where the free web service sleeps and a Render Cron Job runs
 * run-notification-delivery.ts instead. Never enable both: the release
 * isn't safe to run concurrently and would send duplicate emails.
 */
export function startNotificationDeliveryJob(): void {
  const run = async () => {
    try {
      await notificationService.releaseDueNotifications();
    } catch (error) {
      logger.error("Notification delivery job failed", { error });
    }
  };

  void run();
  cron.schedule("0 6 * * *", run);
}
