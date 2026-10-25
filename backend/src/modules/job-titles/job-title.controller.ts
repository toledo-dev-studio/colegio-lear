import { Request, Response } from "express";
import { JobTitleService } from "./job-title.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { JobTitleFilters, JobTitleTypes } from "./job-title.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new JobTitleService(prisma);

/**
 * Builds a JobTitleFilters object from validated query parameters.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 * Converts string "true"/"false" to boolean for the isActive field.
 * Converts jobTitleType from query string to the correct JobTitleTypes type.
 */
function buildFilters(query: Record<string, unknown>): JobTitleFilters {
  const filters: JobTitleFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.jobTitleType !== undefined)
    filters.jobTitleType = query.jobTitleType as JobTitleTypes;
  if (query.isActive !== undefined)
    filters.isActive = query.isActive === "true";

  return filters;
}

/**
 * GET /job-titles
 * Returns all job titles matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /job-titles/paged
 * Returns a paginated list of job titles matching the optional query filters.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
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
 * GET /job-titles/:id
 * Returns a single job title by its UUID.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /job-titles
 * Creates a new job title and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /job-titles/:id
 * Partially updates an existing job title.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data);
}

/**
 * DELETE /job-titles/:id
 * Soft-deletes a job title by setting isDeleted to true.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}
