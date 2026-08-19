import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import { UnauthorizedError } from "../errors/app-error";

/** Shape of the student JWT access token payload. */
interface StudentJwtPayload {
  studentId: string;
  email: string;
}

/**
 * Parse JWT expiration string (e.g. "15m", "1h", "7d") to milliseconds.
 */
function parseExpirationToMs(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match || !match[1] || !match[2]) return 900000;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 900000;
  }
}

/**
 * Express middleware that verifies the student JWT access token.
 * Mirrors shared/middleware/auth.middleware.ts (employee auth) but with the
 * student's payload shape — kept as a separate middleware (not merged with
 * `authenticate`) because student-portal routes never go through
 * authorize(<moduleKey>) (employee RBAC) and are mounted on their own routers.
 *
 * Extraction priority:
 *   1. Cookie `access_token` (set by POST /auth/student/login)
 *   2. Authorization header with "Bearer " prefix (fallback for API clients)
 *
 * Implements the same sliding expiration as the employee middleware: on each
 * successful request a new JWT is issued and the cookie is refreshed.
 *
 * Throws UnauthorizedError for missing, expired, or invalid tokens. Does not
 * re-check Student.isActive/isDeleted on every request (same as the employee
 * middleware, which doesn't re-check Employee.isActive either) — an
 * account disabled mid-session stays valid until the token naturally expires.
 */
export async function authenticateStudent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let token: string | undefined = req.cookies?.access_token;
  const fromCookie = !!token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    throw new UnauthorizedError("Access token is required");
  }

  let decoded: StudentJwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as StudentJwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Access token has expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }

  if (!decoded.studentId) {
    throw new UnauthorizedError("Invalid access token");
  }

  req.student = {
    studentId: decoded.studentId,
    email: decoded.email,
  };

  if (fromCookie) {
    const newToken = jwt.sign(
      { studentId: decoded.studentId, email: decoded.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRATION } as SignOptions,
    );

    res.cookie("access_token", newToken, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: parseExpirationToMs(env.JWT_ACCESS_EXPIRATION),
    });
  }

  next();
}
