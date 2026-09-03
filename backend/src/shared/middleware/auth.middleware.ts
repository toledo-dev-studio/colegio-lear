import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import { UnauthorizedError } from "../errors/app-error";
import { prisma } from "../lib/prisma";

/** Shape of the JWT access token payload. */
interface JwtPayload {
  employeeId: string;
  email: string;
  securityRoleId: string;
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
 * Express middleware that verifies the JWT access token and loads the
 * employee's security role permissions into req.user.
 *
 * Extraction priority:
 *   1. Cookie `access_token` (set by login endpoint)
 *   2. Authorization header with "Bearer " prefix (fallback for API clients)
 *
 * Implements sliding expiration: on each successful request, a new JWT is issued
 * and the cookie is refreshed, extending the session as long as the user is active.
 *
 * On success, attaches to req.user:
 *   - employeeId, email, securityRoleId (from JWT)
 *   - permissions (loaded from DB — one query per request, cached on req.user)
 *
 * Throws UnauthorizedError for missing, expired, or invalid tokens.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // 1. Try cookie first
  let token: string | undefined = req.cookies?.access_token;
  const fromCookie = !!token;

  // 2. Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  // 3. No token found in either source
  if (!token) {
    throw new UnauthorizedError("El token de acceso es requerido");
  }

  // 4. Verify token
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("El token de acceso ha expirado");
    }
    throw new UnauthorizedError("Token de acceso inválido");
  }

  // 5. Load permissions for the employee's security role (one DB query per request)
  const role = await prisma.securityRole.findUnique({
    where: { id: decoded.securityRoleId },
    select: {
      permissions: {
        select: {
          moduleKey: true,
          canRead: true,
          canWrite: true,
          canDelete: true,
        },
      },
    },
  });

  // Attach user context — empty permissions array if role not found (will fail
  // at authorize() with 403 rather than here with 401)
  req.user = {
    employeeId: decoded.employeeId,
    email: decoded.email,
    securityRoleId: decoded.securityRoleId,
    permissions: role?.permissions ?? [],
  };

  // 6. Sliding expiration: re-issue token and refresh cookie on every valid request
  if (fromCookie) {
    const newToken = jwt.sign(
      {
        employeeId: decoded.employeeId,
        email: decoded.email,
        securityRoleId: decoded.securityRoleId,
      },
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
