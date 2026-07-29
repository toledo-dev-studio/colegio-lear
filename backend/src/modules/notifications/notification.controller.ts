import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { ForbiddenError, ValidationError } from "../../shared/errors/app-error";
import type { NotificationRecipientTypeKey } from "./notification.types";

const service = new NotificationService(prisma, mailService);

/**
 * GET /notifications/:type/:id (paged)
 * :type is "admin" (this app — admins and teachers alike, all just
 * Employee rows) or "student" (reserved for the not-yet-built
 * student-facing app; same route shape so that app can reuse this
 * endpoint later with minimal changes).
 * Only the authenticated employee's own notifications — the :id path
 * param must match the session, regardless of what the client sends.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { type, id } = req.params as { type: NotificationRecipientTypeKey; id: string };

  if (type === "student") {
    throw new ValidationError(
      "Student notifications are not implemented yet",
    );
  }

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
