import { randomBytes } from "crypto";
import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError, ConflictError, NotFoundError } from "../errors/app-error";
import { sendError, type FieldError } from "../helpers/response.helper";
import { logger } from "../lib/logger";

/** Short correlation id for error reports (e.g. "ERR-8F3AC1"). */
function generateErrorId(): string {
  return `ERR-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Concatenates field-level errors into a single readable string. */
function formatFieldErrors(details: FieldError[]): string {
  return details
    .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
    .join("; ");
}

/**
 * Logs the error server-side under a short correlation id and returns a
 * Spanish, human-readable string built around that id — enough for a user
 * to quote when reporting an issue (and for us to find the matching log
 * entry, with the full stack/context), without exposing stack traces or
 * internal error names in the response body itself.
 */
function logWithErrorId(req: Request, err: unknown): string {
  const errorId = generateErrorId();
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error("Request failed", {
    errorId,
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    employeeId: req.user?.employeeId,
    studentId: req.student?.studentId,
  });
  return `Código de referencia ${errorId}. Si el problema persiste, comparte este código con soporte para que podamos ubicar el registro exacto del error.`;
}

/** Spanish translations for multer's hardcoded English error messages, keyed by MulterError.code. */
const MULTER_MESSAGES_ES: Record<string, string> = {
  LIMIT_FILE_SIZE: "El archivo excede el tamaño máximo permitido",
  LIMIT_FILE_COUNT: "Se excedió la cantidad máxima de archivos permitida",
  LIMIT_UNEXPECTED_FILE: "Campo de archivo inesperado",
  LIMIT_PART_COUNT: "Se excedió la cantidad máxima de partes en el formulario",
  LIMIT_FIELD_KEY: "El nombre de un campo del formulario es demasiado largo",
  LIMIT_FIELD_VALUE: "El valor de un campo del formulario es demasiado largo",
  LIMIT_FIELD_COUNT: "Se excedió la cantidad máxima de campos en el formulario",
  MISSING_FIELD_NAME: "Falta el nombre de un campo del formulario",
};

/**
 * Global error-handling middleware for Express.
 * - Handles AppError instances using their statusCode and message
 * - Maps known Prisma errors to appropriate AppError subclasses
 * - Returns 500 with a generic message for all other errors
 * - `details` in the response is always a string: concatenated field errors
 *   for validation-style failures, or a correlation id (logged server-side
 *   with full context) for everything else
 *
 * Express 5 catches async errors automatically, so this middleware
 * receives them without needing try-catch wrappers.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle known AppError instances
  if (err instanceof AppError) {
    const details = err.details?.length
      ? formatFieldErrors(err.details)
      : logWithErrorId(req, err);
    sendError(res, err.message, err.statusCode, details);
    return;
  }

  // Handle multer upload errors (wrong field name, file too large, etc.) as
  // 400s instead of falling through to a generic 500 — these are always
  // client mistakes on a multipart/form-data request, never server bugs.
  if (err instanceof MulterError) {
    const field = err.field ?? "file";
    const message = MULTER_MESSAGES_ES[err.code] ?? err.message;
    const details = formatFieldErrors([{ field, message }]);
    sendError(res, message, 400, details);
    return;
  }

  // Handle known Prisma errors (they carry a `code` property like "P2002")
  if (err && typeof err === "object" && "code" in err) {
    const prismaCode = (err as { code: string }).code;

    if (prismaCode === "P2002") {
      const mapped = new ConflictError("Ya existe un registro con estos datos");
      sendError(res, mapped.message, mapped.statusCode, logWithErrorId(req, err));
      return;
    }

    if (prismaCode === "P2025") {
      const mapped = new NotFoundError("El registro no existe");
      sendError(res, mapped.message, mapped.statusCode, logWithErrorId(req, err));
      return;
    }

    if (prismaCode === "P2003") {
      const mapped = new ConflictError(
        "La operación viola una relación con otro registro",
      );
      sendError(res, mapped.message, mapped.statusCode, logWithErrorId(req, err));
      return;
    }
  }

  // Unrecognized error — generic 500, still logged and traceable via errorId
  sendError(
    res,
    "Ocurrió un error inesperado en el servidor",
    500,
    logWithErrorId(req, err),
  );
}
