import { Request, Response } from "express";
import { AnnouncementService } from "./announcement.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { AnnouncementFilters } from "./announcement.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new AnnouncementService(prisma);

/**
 * Builds an AnnouncementFilters object from validated query parameters.
 * Converts status string to boolean; passes publishedAt/expiresAt as-is.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): AnnouncementFilters {
  const filters: AnnouncementFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined) filters.status = query.status === "true";
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

  sendSuccess(res, data, "Announcements retrieved");
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
    {
      page: result.currentPage,
      limit: pageSize,
      total: result.itemsCount,
      totalPages: result.totalPages,
    },
    "Announcements retrieved",
  );
}

/**
 * GET /announcements/:id
 * Returns a single announcement by its UUID, including its attachments.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data, "Announcement retrieved");
}

/**
 * POST /announcements
 * Creates a new announcement and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, "Announcement created", 201);
}

/**
 * PATCH /announcements/:id
 * Partially updates an existing announcement.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data, "Announcement updated");
}

/**
 * DELETE /announcements/:id
 * Soft-deletes an announcement by setting status to false.
 */
export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendSuccess(res, null, "Comunicado desactivado correctamente");
}
