import { Response } from "express";

/**
 * Pagination metadata included in paginated success responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Field-level error detail included in error responses.
 */
export interface FieldError {
  field?: string;
  message: string;
}

/**
 * Send a standard success response.
 * Format: { code, message, data }
 */
export function sendSuccess(
  res: Response,
  data: object | null,
  message: string,
  code: number = 200,
): void {
  res.status(code).json({ code, message, data });
}

/**
 * Send a paginated success response.
 * Format: { code, message, data, pagination }
 */
export function sendPaginatedSuccess(
  res: Response,
  data: unknown[],
  pagination: PaginationMeta,
  message: string,
  code: number = 200,
): void {
  res.status(code).json({ code, message, data, pagination });
}

/**
 * Send a standard error response.
 * Format: { code, message, details }
 */
export function sendError(
  res: Response,
  message: string,
  code: number,
  details?: FieldError[] | null,
): void {
  res.status(code).json({ code, message, details: details ?? null });
}
