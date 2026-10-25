import { ValidationError } from "../errors/app-error";

/**
 * Parsed pagination parameters with validated defaults.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata returned by buildPaginationMeta.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Maximum allowed value for the limit parameter. */
const MAX_LIMIT = 100;

/** Default page when not provided. */
const DEFAULT_PAGE = 1;

/** Default limit when not provided. */
const DEFAULT_LIMIT = 10;

/**
 * Parse and validate pagination parameters from query params.
 * Defaults: page=1, limit=10. Caps limit at 100.
 * Throws ValidationError for non-positive integers.
 */
export function parsePagination(
  query: Record<string, unknown>,
): PaginationParams {
  const rawPage = query.page;
  const rawLimit = query.limit;

  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;

  const errors: Array<{ field: string; message: string }> = [];

  if (rawPage !== undefined && rawPage !== null) {
    const parsed = Number(rawPage);
    if (!Number.isInteger(parsed) || parsed < 1) {
      errors.push({
        field: "page",
        message: "page debe ser un número entero positivo",
      });
    } else {
      page = parsed;
    }
  }

  if (rawLimit !== undefined && rawLimit !== null) {
    const parsed = Number(rawLimit);
    if (!Number.isInteger(parsed) || parsed < 1) {
      errors.push({
        field: "limit",
        message: "limit debe ser un número entero positivo",
      });
    } else {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError("Parámetros de paginación inválidos", errors);
  }

  return { page, limit };
}

/**
 * Build pagination metadata from total record count and current params.
 * Calculates totalPages as Math.ceil(total / limit).
 */
export function buildPaginationMeta(
  total: number,
  params: PaginationParams,
): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit),
  };
}

/**
 * Calculate the Prisma skip value for offset-based pagination.
 * Returns (page - 1) * limit.
 */
export function calculateSkip(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}
