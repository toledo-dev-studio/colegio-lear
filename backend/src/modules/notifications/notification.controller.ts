import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { ForbiddenError } from "../../shared/errors/app-error";

const service = new NotificationService(prisma, mailService);

/**
 * GET /notifications/:type/:id (paged)
 * :type is always "admin" here (admins and teachers alike, all just
 * Employee rows) — a request for :type "student" never reaches this
 * function at all: notification-student.routes.ts is mounted at the literal
 * path /notifications/student/:studentId, before this router, and Express
 * matches it first (see that file for why no gateStudentSession is needed —
 * "student" and "admin" are distinct literal path segments, not a shared URL).
 * Only the authenticated employee's own notifications — the :id path
 * param must match the session, regardless of what the client sends.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { employeeId: authenticatedEmployeeId } = req.user!;

  if (id !== authenticatedEmployeeId) {
    throw new ForbiddenError("You can only view your own notifications");
  }

  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(id, {
    page,
    limit: pageSize,
  });

  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/**
 * POST /notifications/:id/read
 * Marks a notification as read. Ownership is verified in the service
 * (throws ForbiddenError if it doesn't belong to the authenticated employee).
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { employeeId } = req.user!;

  await service.markAsRead(employeeId, id);

  sendSuccess(res, null);
}

/**
 * GET /notifications/student/:studentId (paged)
 * Student-portal equivalent of findAllPaged above — same shape, scoped to
 * the authenticated student's own notifications.
 */
export async function findAllPagedStudent(req: Request, res: Response): Promise<void> {
  const { studentId } = req.params as { studentId: string };

  if (studentId !== req.student!.studentId) {
    throw new ForbiddenError("You can only view your own notifications");
  }

  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPagedForStudent(studentId, {
    page,
    limit: pageSize,
  });

  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/**
 * POST /notifications/student/:studentId/read
 * Student-portal equivalent of markAsRead above.
 */
export async function markAsReadStudent(req: Request, res: Response): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const { notificationId } = req.body as { notificationId: string };

  if (studentId !== req.student!.studentId) {
    throw new ForbiddenError("You can only modify your own notifications");
  }

  await service.markAsReadForStudent(studentId, notificationId);

  sendSuccess(res, null);
}
