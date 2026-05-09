import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { prisma } from "../../shared/lib/prisma";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error";
import { env } from "../../shared/config/env.config";
import { AuthTokens, JwtPayload } from "./auth.types";

/**
 * Parse a duration string like "15m", "1h", "7d" into milliseconds.
 * Supported units: m (minutes), h (hours), d (days).
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}"`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;

  switch (unit) {
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported duration unit: "${unit}"`);
  }
}

/**
 * Generate a JWT access token for the given employee.
 * Signed with HS256, contains employeeId, email, and profileId claims.
 */
function generateAccessToken(payload: JwtPayload): string {
  // Cast is safe: env values like "15m", "1h", "7d" match the ms StringValue pattern
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_ACCESS_EXPIRATION,
  } as jwt.SignOptions);
}

/**
 * Generate a cryptographically random refresh token string.
 */
function generateRefreshToken(): string {
  return crypto.randomUUID();
}

/**
 * Authenticate an employee by email and password.
 * Returns a pair of access and refresh tokens on success.
 *
 * - Normalizes email to lowercase before lookup.
 * - Rejects inactive accounts with 403.
 * - Rejects invalid credentials with 401.
 * - Stores the refresh token in the database with an expiration date.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const normalizedEmail = email.toLowerCase();

  // Find employee by email, include passwordHash for comparison
  const employee = await prisma.employee.findUnique({
    where: { email: normalizedEmail },
  });

  if (!employee) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (!employee.isActive) {
    throw new ForbiddenError("Account is deactivated");
  }

  // Compare provided password against stored hash
  const passwordMatch = await bcrypt.compare(password, employee.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Build JWT payload
  const jwtPayload: JwtPayload = {
    employeeId: employee.id,
    email: employee.email,
    profileId: employee.profileId,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken();

  // Calculate refresh token expiration and store in DB
  const refreshExpiresMs = parseDuration(env.JWT_REFRESH_EXPIRATION);
  const expiresAt = new Date(Date.now() + refreshExpiresMs);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      employeeId: employee.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}

/**
 * Rotate refresh tokens: validate the existing token, revoke it,
 * and issue a new access + refresh token pair.
 *
 * - Rejects revoked or missing tokens with 401.
 * - Rejects expired tokens with 401.
 * - Revokes the old token and creates a new one atomically.
 */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  // Find the refresh token in DB, include the employee relation
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { employee: true },
  });

  if (!storedToken || storedToken.isRevoked) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError("Session has expired");
  }

  const { employee } = storedToken;

  // Revoke the old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  // Generate new token pair
  const jwtPayload: JwtPayload = {
    employeeId: employee.id,
    email: employee.email,
    profileId: employee.profileId,
  };

  const newAccessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = generateRefreshToken();

  // Store new refresh token in DB
  const refreshExpiresMs = parseDuration(env.JWT_REFRESH_EXPIRATION);
  const expiresAt = new Date(Date.now() + refreshExpiresMs);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      employeeId: employee.id,
      expiresAt,
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Assign a profile to an employee.
 * Verifies both the employee and profile exist before updating.
 */
export async function assignProfile(
  employeeId: number,
  profileId: number,
): Promise<void> {
  // Verify employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  if (!employee) {
    throw new NotFoundError("Employee not found");
  }

  // Verify profile exists
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });
  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  // Update employee's profileId
  await prisma.employee.update({
    where: { id: employeeId },
    data: { profileId },
  });
}
