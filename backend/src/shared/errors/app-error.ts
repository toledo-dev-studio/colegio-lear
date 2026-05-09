/**
 * Base application error class.
 * All custom errors extend this to carry an HTTP status code
 * and an optional array of field-level details.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: Array<{ field?: string; message: string }> | null;

  constructor(
    message: string,
    statusCode: number,
    details?: Array<{ field?: string; message: string }> | null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details ?? null;

    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 — Validation failures, malformed input */
export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    details?: Array<{ field?: string; message: string }> | null,
  ) {
    super(message, 400, details);
  }
}

/** 401 — Missing, expired, or invalid credentials / tokens */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 — Authenticated but lacking required privileges */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/** 404 — Requested resource does not exist */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/** 409 — Duplicate resource or constraint conflict */
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
