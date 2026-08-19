import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError, ConflictError, NotFoundError } from "../errors/app-error";
import { sendError } from "../helpers/response.helper";
import { logger } from "../lib/logger";

/**
 * Global error-handling middleware for Express.
 * - Handles AppError instances using their statusCode, message, and details
 * - Maps known Prisma errors to appropriate AppError subclasses
 * - Returns 500 with generic message for all other errors
 * - Logs unhandled (non-AppError) errors with stack trace
 *
 * Express 5 catches async errors automatically, so this middleware
 * receives them without needing try-catch wrappers.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle known AppError instances
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle multer upload errors (wrong field name, file too large, etc.) as
  // 400s instead of falling through to a generic 500 — these are always
  // client mistakes on a multipart/form-data request, never server bugs.
  if (err instanceof MulterError) {
    const field = err.field ?? "file";
    sendError(res, err.message, 400, [{ field, message: err.message }]);
    return;
  }

  // Handle known Prisma errors (they carry a `code` property like "P2002")
  if (err && typeof err === "object" && "code" in err) {
    const prismaCode = (err as { code: string }).code;

    if (prismaCode === "P2002") {
      const mapped = new ConflictError("Unique constraint violation");
      sendError(res, mapped.message, mapped.statusCode, mapped.details);
      return;
    }

    if (prismaCode === "P2025") {
      const mapped = new NotFoundError("Record not found");
      sendError(res, mapped.message, mapped.statusCode, mapped.details);
      return;
    }

    if (prismaCode === "P2003") {
      const mapped = new ConflictError("Foreign key constraint violation");
      sendError(res, mapped.message, mapped.statusCode, mapped.details);
      return;
    }
  }

  // Log unhandled errors with stack trace
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error("Unhandled error", {
    message: error.message,
    stack: error.stack,
  });

  // Return generic 500 response
  sendError(res, "Internal server error", 500);
}
