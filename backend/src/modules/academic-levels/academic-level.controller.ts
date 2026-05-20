import { Request, Response } from "express";
import { AcademicLevelService } from "./academic-level.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import { parsePagination } from "../../shared/helpers/pagination.helper";
import type {
  AcademicLevelFilters,
  EducationLevelFilters,
} from "./academic-level.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new AcademicLevelService(prisma);

/**
 * Builds an AcademicLevelFilters object from validated query parameters.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 * Converts string "true"/"false" to boolean for the status field.
 */
function buildFilters(query: Record<string, unknown>): AcademicLevelFilters {
  const filters: AcademicLevelFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined) filters.status = query.status === "true";

  return filters;
}

/**
 * Builds an EducationLevelFilters object from validated query parameters.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 * Converts string "true"/"false" to boolean for the status field.
 */
function buildEducationLevelFilters(
  query: Record<string, unknown>,
): EducationLevelFilters {
  const filters: EducationLevelFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.status !== undefined) filters.status = query.status === "true";
  if (query.academicLevelId !== undefined)
    filters.academicLevelId = query.academicLevelId as string;

  return filters;
}

/**
 * GET /academic-levels
 * Returns all academic levels matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /academic-levels/paged
 * Returns a paginated list of academic levels matching the optional query filters.
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
 * GET /academic-levels/:id
 * Returns a single academic level by its UUID, including its education levels.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /academic-levels
 * Creates a new academic level and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /academic-levels/:id
 * Partially updates an existing academic level.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data);
}

/**
 * DELETE /academic-levels/:id
 * Soft-deletes an academic level by setting status to false.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}

/**
 * GET /academic-levels/education-levels/paged
 * Returns a paginated list of education levels matching the optional query filters.
 */
export async function findEducationLevelsPaged(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as Record<string, unknown>;
  const filters = buildEducationLevelFilters(query);

  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findEducationLevelsPaged(filters, {
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
