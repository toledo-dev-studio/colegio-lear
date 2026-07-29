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
 * Actual in-app notification rows (and emails) are only ever created for
 * employees — there is no student-facing app yet to display them. A
 * "student" audience entry on an announcement still counts toward
 * recipientsCount (see notifyAnnouncementPublished), it just doesn't
 * generate a row here.
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
    const where = { employeeId, recipientType: "admin" as const };

    const [data, itemsCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pagination.limit,
      }),
      this.prisma.notification.count({ where }),
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
   * Resolves an announcement's audience, updates the announcement's
   * recipientsCount to reflect the TRUE audience size (employees matching
   * teacher/administrative-staff + active students, when included), creates
   * notification rows only for the resolved employees, and fires off the
   * (never-awaited) email batch to them. For ASYNC_JOB_NOTIFICATION_THRESHOLD+
   * employee recipients, also brackets that email batch with "job
   * started"/"job completed" notifications for the employee who created the
   * announcement.
   *
   * Called the moment a campaign's status first becomes "in-progress"
   * (alreadyPublished false -> true) — not at creation time, since a
   * campaign can now sit in "draft" indefinitely before being published.
   *
   * "student" audience entries count toward recipientsCount but never
   * generate a notification row or email — there's no student-facing app
   * yet to show them anything.
   */
  async notifyAnnouncementPublished(
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

    const [employeeRecipients, studentCount] = await Promise.all([
      jobTitleTypes.length > 0
        ? this.prisma.employee.findMany({
            where: {
              isDeleted: false,
              isActive: true,
              jobTitle: { jobTitleType: { in: jobTitleTypes as never[] } },
            },
            select: { id: true, email: true, name: true },
          })
        : Promise.resolve([]),
      audience.includes("student")
        ? this.prisma.student.count({ where: { isActive: true, isDeleted: false } })
        : Promise.resolve(0),
    ]);

    await this.prisma.announcement.update({
      where: { id: announcement.id },
      data: {
        recipientsCount: employeeRecipients.length + studentCount,
        viewedCount: 0,
        viewsCalculatedAt: new Date(),
      },
    });

    if (employeeRecipients.length === 0) return;

    await this.prisma.notification.createMany({
      data: employeeRecipients.map((r) => ({
        employeeId: r.id,
        title: announcement.name,
        message: announcement.description ?? "Se publicó un nuevo comunicado.",
        type: "announcement" as const,
        relatedRecordId: announcement.id,
      })),
    });

    // Email is always sent in the background — never blocks the response,
    // regardless of recipient count.
    const isBigBatch =
      employeeRecipients.length >= ASYNC_JOB_NOTIFICATION_THRESHOLD;

    void this.sendAnnouncementEmails(
      announcement,
      employeeRecipients,
      actorEmployeeId,
      isBigBatch,
    );
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
