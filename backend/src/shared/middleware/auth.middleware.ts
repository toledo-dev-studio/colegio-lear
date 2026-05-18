import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env.config";
import { UnauthorizedError } from "../errors/app-error";

/** Shape of the JWT access token payload. */
interface JwtPayload {
  employeeId: string;
  email: string;
  securityRoleId: string;
}

/**
 * Express middleware that verifies the JWT access token.
 * Extraction priority:
 *   1. Cookie `access_token` (set by login endpoint)
 *   2. Authorization header with "Bearer " prefix (fallback for API clients)
 *
 * On success, attaches the decoded payload to `req.user` and calls next().
 * Throws UnauthorizedError for missing, expired, or invalid tokens.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // 1. Try cookie first
  let token: string | undefined = req.cookies?.access_token;

  // 2. Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  // 3. No token found in either source
  if (!token) {
    throw new UnauthorizedError("Access token is required");
  }

  // 4. Verify token
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      employeeId: decoded.employeeId,
      email: decoded.email,
      securityRoleId: decoded.securityRoleId,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Access token has expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}
