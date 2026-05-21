import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { env } from "../../shared/config/env.config";
import type { CookieConfig } from "./auth.types";

/**
 * Shared service instance used by all controller handlers.
 * Receives the singleton PrismaClient and mail service for dependency injection.
 */
const service = new AuthService(prisma, mailService);

/**
 * Build cookie options for the access_token cookie.
 * Uses environment configuration for secure flag and JWT expiration for maxAge.
 */
function buildCookieOptions(): CookieConfig {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: service.parseExpirationToMs(env.JWT_ACCESS_EXPIRATION),
  };
}

/**
 * POST /auth/login
 * Authenticates an employee by username/email + password.
 * Sets the access_token HttpOnly cookie and returns employee data.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  const result = await service.login(username, password);

  // Set HttpOnly cookie with JWT
  const cookieOptions = buildCookieOptions();
  res.cookie("access_token", result.token, cookieOptions);

  sendSuccess(res, result.employee);
}

/**
 * POST /auth/logout
 * Clears the access_token cookie to end the session on the client side.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  const cookieOptions = buildCookieOptions();
  res.clearCookie("access_token", { ...cookieOptions, maxAge: 0 });

  sendSuccess(res, null);
}

/**
 * POST /auth/forgot-password
 * Generates a temporary password and sends it via email.
 * Always responds with 200 regardless of whether the email exists (prevents account enumeration).
 */
export async function forgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { username } = req.body;
  await service.forgotPassword(username);

  sendSuccess(res, null);
}

/**
 * POST /auth/change-password
 * Changes the employee's password using the reset token + 6-digit code.
 * Public endpoint — no session required.
 */
export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { token, code, password } = req.body;

  await service.changePassword(token, code, password);

  sendSuccess(res, null);
}

/**
 * GET /auth/me
 * Returns the authenticated employee's profile data.
 * Requires a valid access_token cookie (or Authorization header).
 * The authenticate middleware already validated the token and set req.user.
 */
export async function me(req: Request, res: Response): Promise<void> {
  const { employeeId } = req.user!;
  const employee = await service.getMe(employeeId);
  sendSuccess(res, employee);
}
