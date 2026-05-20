import { Request, Response } from "express";
import { ScholarshipService } from "./scholarship.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { ScholarshipFilters } from "./scholarship.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new ScholarshipService(prisma);

/**
 * Builds a ScholarshipFilters object from validated query parameters.
 * Converts the `status` string ("true"/"false") to a boolean.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): ScholarshipFilters {
  const filters: ScholarshipFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined) filters.status = query.status === "true";
  if (query.discountPercentage !== undefined)
    filters.discountPercentage = query.discountPercentage as number;

  return filters;
}

/**
 * GET /scholarships
 * Returns all scholarships matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /scholarships/paged
 * Returns a paginated list of scholarships matching the optional query filters.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const query = req.query as Record<string, unknown>;
  const filters = buildFilters(query);

  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(filters, { page, pageSize });

  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/**
 * GET /scholarships/:id
 * Returns a single scholarship by its UUID.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /scholarships
 * Creates a new scholarship and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /scholarships/:id
 * Partially updates an existing scholarship.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data);
}

/**
 * DELETE /scholarships/:id
 * Soft-deletes a scholarship by setting status to false.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}
