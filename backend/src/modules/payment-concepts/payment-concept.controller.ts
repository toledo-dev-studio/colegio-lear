import { Request, Response } from "express";
import { PaymentConceptService } from "./payment-concept.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { PaymentConceptFilters } from "./payment-concept.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient for database access.
 */
const service = new PaymentConceptService(prisma);

/**
 * Builds a PaymentConceptFilters object from validated query parameters.
 * Converts `status` and `allowRemission` strings ("true"/"false") to booleans.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): PaymentConceptFilters {
  const filters: PaymentConceptFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined) filters.status = query.status === "true";
  if (query.allowRemission !== undefined)
    filters.allowRemission = query.allowRemission === "true";
  if (query.baseAmount !== undefined)
    filters.baseAmount = query.baseAmount as number;
  if (query.minAmount !== undefined)
    filters.minAmount = query.minAmount as number;
  if (query.maxAmount !== undefined)
    filters.maxAmount = query.maxAmount as number;

  return filters;
}

/**
 * GET /payment-concepts
 * Returns all payment concepts matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data, "Payment concepts retrieved successfully");
}

/**
 * GET /payment-concepts/paged
 * Returns a paginated list of payment concepts matching the optional query filters.
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
    {
      page: result.currentPage,
      limit: pageSize,
      total: result.itemsCount,
      totalPages: result.totalPages,
    },
    "Payment concepts retrieved successfully",
  );
}

/**
 * GET /payment-concepts/:id
 * Returns a single payment concept by its UUID.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data, "Payment concept retrieved successfully");
}

/**
 * POST /payment-concepts
 * Creates a new payment concept and returns the created record.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, "Payment concept created successfully", 201);
}

/**
 * PATCH /payment-concepts/:id
 * Partially updates an existing payment concept.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.update(id, req.body);

  sendSuccess(res, data, "Payment concept updated successfully");
}

/**
 * DELETE /payment-concepts/:id
 * Soft-deletes a payment concept by setting status to false.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendSuccess(res, null, "Concepto de pago desactivado correctamente");
}
