import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ForbiddenError } from "../../shared/errors/app-error";
import type { IMailService } from "../../shared/services/mail.service";
import { announcementNotificationEmail } from "../../shared/templates/email.templates";
import { logger } from "../../shared/lib/logger";
import { env } from "../../shared/config/env.config";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";
import type {
  NotificationRecord,
  NotificationTypeKey,
  PagedResult,
} from "./notification.types";

/**
 * Announcements with this many resolved employee recipients (or more) get
 * "job started"/"job completed" notifications bracketing the background
 * email fan-out, since that's the part that can actually take a while
 * (one SMTP round-trip per recipient). Below this, the email batch is fast
 * enough that the extra notifications aren't worth the noise.
 */
const ASYNC_JOB_NOTIFICATION_THRESHOLD = 100;

interface AnnouncementForNotification {
  id: string;
  name: string;
  description: string | null;
  audience: unknown;
}

/**
 * Business logic layer for the Notifications module.
 * Recipients are employees only — there is no student-facing app yet to
 * display notifications, so a "student" audience entry on an announcement
 * does not generate rows here (see notifyAnnouncementCreated).
 */
export class NotificationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mail: IMailService,
  ) {}

  private toRecord(raw: Record<string, unknown>): NotificationRecord {
    return {
      id: raw.id as string,
      title: raw.title as string,
      message: raw.message as string,
      type: raw.type as NotificationTypeKey,
      relatedRecordId: raw.relatedRecordId as string,
      createdAt: (raw.createdAt as Date).toISOString(),
      read: raw.read as boolean,
    };
  }

  /** GET paginated notifications for an employee, most recent first. */
  async findAllPaged(
    employeeId: string,
    pagination: PaginationParams,
  ): Promise<PagedResult<NotificationRecord>> {
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { employeeId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pagination.limit,
      }),
      this.prisma.notification.count({ where: { employeeId } }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((r) => this.toRecord(r as unknown as Record<string, unknown>)),
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Marks a notification as read. Throws ForbiddenError if it doesn't
   * belong to the requesting employee. Idempotent: re-marking an
   * already-read notification is a no-op (does not double-increment the
   * related announcement's viewedCount).
   */
  async markAsRead(employeeId: string, id: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.employeeId !== employeeId) {
      throw new ForbiddenError("This notification does not belong to you");
    }

    if (notification.read) return;

    await this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    // Keep Announcement.viewedCount live-accurate rather than waiting for
    // the (future) periodic recalculation cron.
    if (notification.type === "announcement") {
      await this.prisma.announcement.update({
        where: { id: notification.relatedRecordId },
        data: { viewedCount: { increment: 1 } },
      });
    }
  }

  /**
   * Resolves an announcement's audience to real employee recipients, creates
   * their notification rows, updates the announcement's recipientsCount, and
   * fires off the (never-awaited) email batch. For ASYNC_JOB_NOTIFICATION_THRESHOLD+
   * recipients, also brackets that email batch with "job started"/"job
   * completed" notifications for the employee who created the announcement.
   *
   * "student" audience entries are skipped — there's no student-facing app
   * yet to show them a notification.
   */
  async notifyAnnouncementCreated(
    announcement: AnnouncementForNotification,
    actorEmployeeId: string,
  ): Promise<void> {
    const audience = Array.isArray(announcement.audience)
      ? (announcement.audience as string[])
      : [];

    const jobTitleTypes: string[] = [];
    if (audience.includes("teacher")) jobTitleTypes.push("teacher");
    if (audience.includes("administrative-staff"))
      jobTitleTypes.push("administrative_staff");

    const recipients =
      jobTitleTypes.length > 0
        ? await this.prisma.employee.findMany({
            where: {
              isDeleted: false,
              isActive: true,
              jobTitle: { jobTitleType: { in: jobTitleTypes as never[] } },
            },
            select: { id: true, email: true, name: true },
          })
        : [];

    if (recipients.length === 0) {
      await this.prisma.announcement.update({
        where: { id: announcement.id },
        data: { recipientsCount: 0, viewedCount: 0, viewsCalculatedAt: new Date() },
      });
      return;
    }

    await this.prisma.notification.createMany({
      data: recipients.map((r) => ({
        employeeId: r.id,
        title: announcement.name,
        message: announcement.description ?? "Se publicó un nuevo comunicado.",
        type: "announcement" as const,
        relatedRecordId: announcement.id,
      })),
    });

    await this.prisma.announcement.update({
      where: { id: announcement.id },
      data: {
        recipientsCount: recipients.length,
        viewedCount: 0,
        viewsCalculatedAt: new Date(),
      },
    });

    // Email is always sent in the background — never blocks the response,
    // regardless of recipient count.
    const isBigBatch = recipients.length >= ASYNC_JOB_NOTIFICATION_THRESHOLD;

    void this.sendAnnouncementEmails(announcement, recipients, actorEmployeeId, isBigBatch);
  }

  /** Fire-and-forget: never awaited by the caller. */
  private async sendAnnouncementEmails(
    announcement: AnnouncementForNotification,
    recipients: Array<{ id: string; email: string; name: string }>,
    actorEmployeeId: string,
    isBigBatch: boolean,
  ): Promise<void> {
    if (isBigBatch) {
      await this.createProcessNotification(actorEmployeeId, announcement.id, {
        title: "Envío de comunicado en proceso",
        message: `Se inició el envío de notificaciones para "${announcement.name}" a ${recipients.length} destinatarios.`,
        type: "info",
      });
    }

    const results = await Promise.allSettled(
      recipients.map((r) =>
        this.mail.sendMail({
          to: r.email,
          subject: `Nuevo comunicado: ${announcement.name}`,
          html: announcementNotificationEmail({
            employeeName: r.name,
            announcementName: announcement.name,
            announcementDescription: announcement.description,
            frontendUrl: env.FRONTEND_URL,
          }),
        }),
      ),
    );

    const failedCount = results.filter((r) => r.status === "rejected").length;
    if (failedCount > 0) {
      logger.error("Failed to send some announcement notification emails", {
        announcementId: announcement.id,
        failedCount,
        totalCount: recipients.length,
      });
    }

    if (isBigBatch) {
      await this.createProcessNotification(actorEmployeeId, announcement.id, {
        title: "Envío de comunicado completado",
        message:
          failedCount > 0
            ? `Se completó el envío para "${announcement.name}" (${failedCount} correo(s) fallaron de ${recipients.length}).`
            : `Se completó el envío de notificaciones para "${announcement.name}" a ${recipients.length} destinatarios.`,
        type: failedCount > 0 ? "error" : "info",
      });
    }
  }

  private async createProcessNotification(
    employeeId: string,
    relatedRecordId: string,
    params: { title: string; message: string; type: "info" | "error" },
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        employeeId,
        title: params.title,
        message: params.message,
        type: params.type,
        relatedRecordId,
      },
    });
  }
}
