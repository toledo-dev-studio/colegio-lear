import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { ForbiddenError } from "../../shared/errors/app-error";

const service = new NotificationService(prisma, mailService);

/**
 * GET /notifications/employees/:employeeId (paged)
 * Only the authenticated employee's own notifications — the employeeId
 * path param must match the session, regardless of what the client sends.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { employeeId } = req.params as { employeeId: string };
  const { employeeId: authenticatedEmployeeId } = req.user!;

  if (employeeId !== authenticatedEmployeeId) {
    throw new ForbiddenError("You can only view your own notifications");
  }

  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(employeeId, {
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
