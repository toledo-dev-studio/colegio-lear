import { Request, Response } from "express";
import { SecurityRoleService } from "./security-role.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { SecurityRoleFilters } from "./security-role.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new SecurityRoleService(prisma);

/**
 * Builds a SecurityRoleFilters object from validated query parameters.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 * Converts string "true"/"false" to boolean for the isActive field.
 */
function buildFilters(query: Record<string, unknown>): SecurityRoleFilters {
  const filters: SecurityRoleFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.isActive !== undefined)
    filters.isActive = query.isActive === "true";

  return filters;
}

/**
 * GET /security-roles
 * Returns all security roles matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /security-roles/paged
 * Returns a paginated list of security roles matching the optional query filters.
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
 * GET /security-roles/:id
 * Returns a single security role by its UUID, including permissions.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /security-roles
 * Creates a new security role with permissions and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /security-roles/:id
 * Partially updates an existing security role (with optional permissions sync).
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data);
}

/**
 * DELETE /security-roles/:id
 * Soft-deletes a security role by setting isDeleted to true.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}
