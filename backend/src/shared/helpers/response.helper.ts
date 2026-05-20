import { Response } from "express";

/**
 * Field-level error detail included in error responses.
 */
export interface FieldError {
  field?: string;
  message: string;
}

/**
 * Send a standard success response.
 * Format: { data }
 */
export function sendSuccess(
  res: Response,
  data: unknown,
  code: number = 200,
): void {
  res.status(code).json(data);
}

/**
 * Send a paginated success response.
 * Format: { data, totalPages, currentPage, itemsCount }
 * Matches the frontend PagedResponse<T> interface.
 */
export function sendPaginatedSuccess(
  res: Response,
  data: unknown[],
  totalPages: number,
  currentPage: number,
  itemsCount: number,
): void {
  res.status(200).json({ data, totalPages, currentPage, itemsCount });
}

/**
 * Send a 204 No Content response (for DELETE operations).
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send a standard error response.
 * Format: { error, details? }
 */
export function sendError(
  res: Response,
  error: string,
  code: number,
  details?: FieldError[] | null,
): void {
  const body: { error: string; details?: FieldError[] } = { error };
  if (details && details.length > 0) {
    body.details = details;
  }
  res.status(code).json(body);
}
