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
 * Format: { message, details }
 *
 * `details` is always a string, present on every error: for validation-style
 * errors it's the concatenated field errors (see formatFieldErrors), and for
 * everything else it's a short correlation id already logged server-side
 * with full context (see error-handler.middleware.ts) — enough for a user to
 * quote when reporting an issue, without exposing internals in the response.
 */
export function sendError(
  res: Response,
  message: string,
  code: number,
  details: string,
): void {
  res.status(code).json({ message, details });
}
