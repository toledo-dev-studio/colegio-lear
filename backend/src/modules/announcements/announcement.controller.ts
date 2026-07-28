import { Request, Response } from "express";
import { AnnouncementService } from "./announcement.service";
import { NotificationService } from "../notifications/notification.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { AnnouncementFilters } from "./announcement.types";

/**
 * Shared service instances used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new AnnouncementService(prisma);
const notificationService = new NotificationService(prisma, mailService);

/**
 * Builds an AnnouncementFilters object from validated query parameters.
 * Passes status/publishedAt/expiresAt as-is.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): AnnouncementFilters {
  const filters: AnnouncementFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined)
    filters.status = query.status as NonNullable<AnnouncementFilters["status"]>;
  if (query.publishedAt !== undefined)
    filters.publishedAt = query.publishedAt as string;
  if (query.expiresAt !== undefined)
    filters.expiresAt = query.expiresAt as string;

  return filters;
}

/**
 * GET /announcements
 * Returns all announcements matching the optional query filters.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /announcements/paged
 * Returns a paginated list of announcements matching the optional query filters.
 */
export async function getAllPaged(req: Request, res: Response): Promise<void> {
  const query = req.query as Record<string, unknown>;
  const filters = buildFilters(query);

  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(filters, {
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
 * GET /announcements/:id
 * Returns a single announcement by its UUID, including its attachments.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /announcements
 * Creates a new announcement — "draft" by default, not dispatched to
 * anyone yet. If created directly with status "in-progress" (the frontend
 * allows picking either at creation time), resolves its audience to real
 * employee recipients (teacher/administrative-staff — "student" is
 * skipped, there's no student-facing app yet to show them a notification),
 * creates their notification rows, and fires off the email batch in the
 * background. Re-fetches after dispatch so the response reflects the
 * just-updated recipientsCount/viewedCount/viewsCalculatedAt (the initial
 * create() result predates that update).
 */
export async function create(req: Request, res: Response): Promise<void> {
  const created = await service.create(req.body);

  if (created.alreadyPublished) {
    const { employeeId } = req.user!;
    await notificationService.notifyAnnouncementPublished(created, employeeId);
    const data = await service.findById(created.id);
    sendSuccess(res, data, 201);
    return;
  }

  sendSuccess(res, created, 201);
}

/**
 * PATCH /announcements/:id
 * Partially updates an existing announcement. If this update is the one
 * that flips status to "in-progress" for the first time (alreadyPublished
 * false -> true), dispatches recipient notifications the same way create()
 * does for campaigns published immediately at creation. Later updates
 * (e.g. moving on to "completed"/"cancelled") never re-dispatch — the
 * service already guards alreadyPublished from being reset.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const before = await service.findById(id);
  const updated = await service.update(id, req.body);

  if (!before.alreadyPublished && updated.alreadyPublished) {
    const { employeeId } = req.user!;
    await notificationService.notifyAnnouncementPublished(updated, employeeId);
    const data = await service.findById(id);
    sendSuccess(res, data);
    return;
  }

  sendSuccess(res, updated);
}

/**
 * DELETE /announcements/:id
 * Soft-deletes an announcement by setting isDeleted to true.
 */
export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}
