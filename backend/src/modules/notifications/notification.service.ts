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

interface AnnouncementForNotification {
  id: string;
  name: string;
  description: string | null;
  audience: unknown;
  publishedAt: Date;
}

/** A resolved email recipient, already tied to a specific student when applicable. */
interface EmailRecipient {
  email: string;
  recipientName: string;
  studentName?: string;
  /** Set only for guardian recipients — which student's notification this counts toward. */
  studentId?: string;
}

/**
 * Business logic layer for the Notifications module. Recipients are either
 * employees (recipientType: "admin", employeeId set) or students
 * (recipientType: "student", studentId set) — exactly one of the two ids is
 * ever set on a given row, matching recipientType.
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

  /**
   * GET paginated notifications for an employee, most recent first.
   * Only ever returns released (sent:true) notifications — a scheduled
   * announcement notification stays invisible until the delivery job
   * releases it (see releaseDueNotifications).
   */
  async findAllPaged(
    employeeId: string,
    pagination: PaginationParams,
  ): Promise<PagedResult<NotificationRecord>> {
    const skip = calculateSkip(pagination);
    const where = { employeeId, recipientType: "admin" as const, sent: true };

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

  /** Student-portal equivalent of findAllPaged — same shape, filtered by studentId. */
  async findAllPagedForStudent(
    studentId: string,
    pagination: PaginationParams,
  ): Promise<PagedResult<NotificationRecord>> {
    const skip = calculateSkip(pagination);
    const where = { studentId, recipientType: "student" as const, sent: true };

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

    await this.markReadAndSyncViewedCount(notification);
  }

  /** Student-portal equivalent of markAsRead — same behavior, scoped to studentId. */
  async markAsReadForStudent(studentId: string, id: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.studentId !== studentId) {
      throw new ForbiddenError("This notification does not belong to you");
    }

    await this.markReadAndSyncViewedCount(notification);
  }

  private async markReadAndSyncViewedCount(notification: {
    id: string;
    read: boolean;
    type: string;
    relatedRecordId: string;
  }): Promise<void> {
    if (notification.read) return;

    await this.prisma.notification.update({
      where: { id: notification.id },
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
   * Registers an announcement's notifications: resolves its audience,
   * updates recipientsCount (employees matching teacher/administrative-staff
   * + students actively enrolled in a cycle that's currently "en curso"),
   * and creates one Notification row per resolved recipient (employee or
   * student alike). Always brackets this with "started"/"completed" info
   * notifications to the employee who published it — this step is normally
   * fast (a handful of inserts), so unlike email fan-out there's no
   * batch-size threshold.
   *
   * Called the moment a campaign's status first becomes "in-progress"
   * (alreadyPublished false -> true) — not at creation time, since a
   * campaign can now sit in "draft" indefinitely before being published.
   *
   * The created Notification rows are only actually released (visible in
   * the bell, email sent) once announcement.publishedAt is reached — if
   * that's already in the past, they're released immediately (email sent
   * right away too); otherwise they're created with sent:false and
   * releaseDueNotifications() picks them up later.
   *
   * Student emails go to their principal guardian(s), not the student's own
   * address — same posture as StudentService.sendCredentials.
   *
   * On any failure while registering (DB-level), the whole registration
   * transaction rolls back, the announcement is reverted to
   * status:"draft"/alreadyPublished:false so it can be fixed and
   * re-published, and the actor gets an "error" notification explaining it.
   */
  async notifyAnnouncementPublished(
    announcement: AnnouncementForNotification,
    actorEmployeeId: string,
  ): Promise<void> {
    await this.createProcessNotification(actorEmployeeId, announcement.id, {
      title: "Registro de comunicado en proceso",
      message: `Se está registrando la campaña "${announcement.name}" y resolviendo sus destinatarios.`,
      type: "info",
    });

    let employeeRecipients: Array<{ id: string; email: string; name: string }> = [];
    let studentRecipients: Array<{ id: string; name: string; firstLastName: string }> = [];
    let totalRecipients = 0;
    const isDue = announcement.publishedAt <= new Date();

    try {
      const audience = Array.isArray(announcement.audience)
        ? (announcement.audience as string[])
        : [];

      const jobTitleTypes: string[] = [];
      if (audience.includes("teacher")) jobTitleTypes.push("teacher");
      if (audience.includes("administrative-staff"))
        jobTitleTypes.push("administrative_staff");

      [employeeRecipients, studentRecipients] = await Promise.all([
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
        // Only students actively enrolled in a cycle that's currently "en
        // curso" — an inactive student, or one enrolled only in a cycle
        // that hasn't started/already ended, shouldn't count or be notified.
        audience.includes("student")
          ? this.prisma.student.findMany({
              where: {
                isActive: true,
                isDeleted: false,
                academicCycleEnrollments: {
                  some: {
                    status: "enrolled",
                    academicCycle: { status: "active" },
                  },
                },
              },
              select: { id: true, name: true, firstLastName: true },
            })
          : Promise.resolve([]),
      ]);
      totalRecipients = employeeRecipients.length + studentRecipients.length;

      await this.prisma.$transaction(async (tx) => {
        if (employeeRecipients.length > 0) {
          await tx.notification.createMany({
            data: employeeRecipients.map((r) => ({
              recipientType: "admin" as const,
              employeeId: r.id,
              title: announcement.name,
              message: announcement.description ?? "Se publicó un nuevo comunicado.",
              type: "announcement" as const,
              relatedRecordId: announcement.id,
              scheduledFor: announcement.publishedAt,
              sent: isDue,
            })),
          });
        }

        if (studentRecipients.length > 0) {
          await tx.notification.createMany({
            data: studentRecipients.map((s) => ({
              recipientType: "student" as const,
              studentId: s.id,
              title: announcement.name,
              message: announcement.description ?? "Se publicó un nuevo comunicado.",
              type: "announcement" as const,
              relatedRecordId: announcement.id,
              scheduledFor: announcement.publishedAt,
              sent: isDue,
            })),
          });
        }

        await tx.announcement.update({
          where: { id: announcement.id },
          data: {
            recipientsCount: totalRecipients,
            viewedCount: 0,
            viewsCalculatedAt: new Date(),
          },
        });
      });
    } catch (error) {
      logger.error("Failed to register announcement notifications", {
        announcementId: announcement.id,
        error,
      });

      // Compensating action, not a user request — bypasses
      // AnnouncementService's own guard against un-publishing.
      await this.prisma.announcement.update({
        where: { id: announcement.id },
        data: { status: "draft" as never, alreadyPublished: false },
      });

      await this.createProcessNotification(actorEmployeeId, announcement.id, {
        title: "Registro de comunicado fallido",
        message: `Ocurrió un error al registrar los destinatarios de "${announcement.name}". La campaña regresó a borrador para que puedas corregir y volver a intentarlo.`,
        type: "error",
      });
      return;
    }

    const whenNote = isDue
      ? ""
      : ` Se les notificará a partir del ${announcement.publishedAt.toLocaleDateString("es-MX")}.`;
    await this.createProcessNotification(actorEmployeeId, announcement.id, {
      title: "Registro de comunicado completado",
      message: `Se registraron ${totalRecipients} destinatario(s) para "${announcement.name}".${whenNote}`,
      type: "info",
    });

    // publishedAt already reached: release immediately instead of waiting
    // for the next delivery-job tick.
    if (isDue) {
      const recipients: EmailRecipient[] = [];
      for (const r of employeeRecipients) {
        recipients.push({ email: r.email, recipientName: r.name });
      }
      if (studentRecipients.length > 0) {
        recipients.push(
          ...(await this.resolveGuardianEmailRecipients(studentRecipients)),
        );
      }
      if (recipients.length > 0) {
        void this.sendAnnouncementEmailBatch(announcement, recipients);
      }
    }
  }

  /**
   * Resolves each student's principal guardian(s) into flat email
   * recipients. A student without a principal guardian (or without an
   * email on file) is silently skipped — same as sendCredentials.
   */
  private async resolveGuardianEmailRecipients(
    students: Array<{ id: string; name: string; firstLastName: string }>,
  ): Promise<EmailRecipient[]> {
    const guardians = await this.prisma.studentGuardian.findMany({
      where: { studentId: { in: students.map((s) => s.id) }, isPrincipal: true },
      select: { studentId: true, fullName: true, email: true },
    });

    const studentById = new Map(students.map((s) => [s.id, s]));
    const recipients: EmailRecipient[] = [];
    for (const guardian of guardians) {
      if (!guardian.email) continue;
      const student = studentById.get(guardian.studentId);
      recipients.push({
        email: guardian.email,
        recipientName: guardian.fullName,
        studentId: guardian.studentId,
        ...(student ? { studentName: `${student.name} ${student.firstLastName}` } : {}),
      });
    }
    return recipients;
  }

  /**
   * How many daily job runs a scheduled notification's email gets to
   * succeed before the job gives up on emailing it and just marks it
   * sent (visible in the bell only, no email ever went out).
   */
  private static readonly MAX_DELIVERY_ATTEMPTS = 3;

  /**
   * Finds every notification scheduled at/before now that hasn't been
   * released yet (sent:false) and releases it: sends its email and flips
   * sent:true so it shows up in the bell. If the email fails, retries on
   * the next daily run (deliveryAttempts+1) — after
   * MAX_DELIVERY_ATTEMPTS failures it gives up on the email but still
   * marks it sent, so the recipient at least sees it in-app. Meant to be
   * called once a day by a scheduled job (see shared/jobs).
   */
  async releaseDueNotifications(): Promise<void> {
    const due = await this.prisma.notification.findMany({
      where: { sent: false, scheduledFor: { lte: new Date() } },
      select: {
        id: true,
        employeeId: true,
        studentId: true,
        relatedRecordId: true,
        type: true,
        deliveryAttempts: true,
      },
    });

    if (due.length === 0) return;

    const byAnnouncement = new Map<string, typeof due>();
    for (const n of due) {
      // Announcements are the only notification type ever created with
      // sent:false today — anything else here would be unexpected, but
      // release it plainly rather than silently dropping it.
      if (n.type !== "announcement") {
        await this.prisma.notification.update({
          where: { id: n.id },
          data: { sent: true },
        });
        continue;
      }
      const list = byAnnouncement.get(n.relatedRecordId) ?? [];
      list.push(n);
      byAnnouncement.set(n.relatedRecordId, list);
    }

    for (const [announcementId, notifications] of byAnnouncement) {
      try {
        const announcement = await this.prisma.announcement.findUnique({
          where: { id: announcementId },
        });
        if (!announcement) {
          // Announcement gone (shouldn't happen) — release without emailing.
          await this.prisma.notification.updateMany({
            where: { id: { in: notifications.map((n) => n.id) } },
            data: { sent: true },
          });
          continue;
        }

        const employeeNotifications = notifications.filter((n) => n.employeeId);
        const studentNotifications = notifications.filter((n) => n.studentId);

        const employeeIds = employeeNotifications
          .map((n) => n.employeeId)
          .filter((id): id is string => id !== null);
        const employees = await this.prisma.employee.findMany({
          where: { id: { in: employeeIds } },
          select: { id: true, email: true, name: true },
        });
        const employeeById = new Map(employees.map((e) => [e.id, e]));

        const studentIds = studentNotifications
          .map((n) => n.studentId)
          .filter((id): id is string => id !== null);
        const students = await this.prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, name: true, firstLastName: true },
        });
        const guardiansByStudentId = new Map<string, EmailRecipient[]>();
        if (students.length > 0) {
          for (const recipient of await this.resolveGuardianEmailRecipients(students)) {
            const list = guardiansByStudentId.get(recipient.studentId!) ?? [];
            list.push(recipient);
            guardiansByStudentId.set(recipient.studentId!, list);
          }
        }

        await Promise.all([
          ...employeeNotifications.map(async (n) => {
            const employee = n.employeeId ? employeeById.get(n.employeeId) : undefined;
            if (!employee) {
              await this.prisma.notification.update({
                where: { id: n.id },
                data: { sent: true },
              });
              return;
            }
            await this.releaseOne(n, announcement, [
              { email: employee.email, recipientName: employee.name },
            ]);
          }),
          ...studentNotifications.map(async (n) => {
            const recipients = n.studentId ? guardiansByStudentId.get(n.studentId) : undefined;
            await this.releaseOne(n, announcement, recipients ?? []);
          }),
        ]);
      } catch (error) {
        logger.error("Failed to release scheduled notifications for announcement", {
          announcementId,
          error,
        });
        // Leave sent:false — the next run retries this announcement.
      }
    }
  }

  /**
   * Releases a single due notification: emails every resolved recipient
   * (an employee has exactly one; a student may have 0+ principal
   * guardians) and marks it sent, retrying on the next daily run on
   * failure. An empty recipient list (no email on file) just releases the
   * notification with no email attempt.
   */
  private async releaseOne(
    notification: { id: string; deliveryAttempts: number },
    announcement: { id: string; name: string; description: string | null },
    recipients: EmailRecipient[],
  ): Promise<void> {
    if (recipients.length === 0) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { sent: true },
      });
      return;
    }

    try {
      await Promise.all(
        recipients.map((r) =>
          this.mail.sendMail({
            to: r.email,
            subject: `Nuevo comunicado: ${announcement.name}`,
            html: announcementNotificationEmail({
              recipientName: r.recipientName,
              announcementName: announcement.name,
              announcementDescription: announcement.description,
              frontendUrl: env.FRONTEND_URL,
              ...(r.studentName ? { studentName: r.studentName } : {}),
            }),
          }),
        ),
      );
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { sent: true },
      });
    } catch (error) {
      const attempts = notification.deliveryAttempts + 1;
      const giveUp = attempts >= NotificationService.MAX_DELIVERY_ATTEMPTS;
      logger.error("Failed to send a scheduled announcement email", {
        announcementId: announcement.id,
        notificationId: notification.id,
        attempts,
        givingUp: giveUp,
        error,
      });
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { deliveryAttempts: attempts, sent: giveUp },
      });
    }
  }

  /** Fire-and-forget: never awaited by the caller. */
  private async sendAnnouncementEmailBatch(
    announcement: AnnouncementForNotification,
    recipients: EmailRecipient[],
  ): Promise<void> {
    const results = await Promise.allSettled(
      recipients.map((r) =>
        this.mail.sendMail({
          to: r.email,
          subject: `Nuevo comunicado: ${announcement.name}`,
          html: announcementNotificationEmail({
            recipientName: r.recipientName,
            announcementName: announcement.name,
            announcementDescription: announcement.description,
            frontendUrl: env.FRONTEND_URL,
            ...(r.studentName ? { studentName: r.studentName } : {}),
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
