import { Request, Response } from "express";
import { SchoolSubjectService } from "./school-subject.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { SubjectFilters } from "./school-subject.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new SchoolSubjectService(prisma);

/**
 * Builds a SubjectFilters object from validated query parameters.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): SubjectFilters {
  const filters: SubjectFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.isActive !== undefined)
    filters.isActive = query.isActive === "true";
  if (query.academicLevelId !== undefined)
    filters.academicLevelId = query.academicLevelId as string;
  if (query.educationLevelId !== undefined)
    filters.educationLevelId = query.educationLevelId as string;

  return filters;
}

/**
 * GET /school-subjects
 * Returns all subjects matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /school-subjects/paged
 * Returns a paginated list of subjects matching the optional query filters.
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
 * GET /school-subjects/:id
 * Returns a single subject by its UUID.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /school-subjects
 * Creates a new school subject and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /school-subjects/:id
 * Partially updates an existing school subject.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data);
}

/**
 * DELETE /school-subjects/:id
 * Soft-deletes a school subject by setting isDeleted to true.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}
