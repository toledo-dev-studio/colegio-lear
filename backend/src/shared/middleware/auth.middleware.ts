import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env.config";
import { UnauthorizedError } from "../errors/app-error";

/** Shape of the JWT access token payload. */
interface JwtPayload {
  employeeId: number;
  email: string;
  profileId: number | null;
}

/**
 * Express middleware that verifies the JWT access token from the Authorization header.
 * On success, attaches the decoded payload to `req.user`.
 * Throws UnauthorizedError for missing, expired, or invalid tokens.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Access token is required");
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      employeeId: decoded.employeeId,
      email: decoded.email,
      profileId: decoded.profileId,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Access token has expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}
