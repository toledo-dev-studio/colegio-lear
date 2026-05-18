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
  const { identifier, password } = req.body;
  const result = await service.login(identifier, password);

  // Set HttpOnly cookie with JWT
  const cookieOptions = buildCookieOptions();
  res.cookie("access_token", result.token, cookieOptions);

  sendSuccess(res, result.employee, "Login exitoso");
}

/**
 * POST /auth/logout
 * Clears the access_token cookie to end the session on the client side.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  const cookieOptions = buildCookieOptions();
  res.clearCookie("access_token", { ...cookieOptions, maxAge: 0 });

  sendSuccess(res, null, "Sesión cerrada correctamente");
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
  const { email } = req.body;
  await service.forgotPassword(email);

  sendSuccess(
    res,
    null,
    "Se envió un correo con instrucciones para recuperar tu contraseña",
  );
}

/**
 * POST /auth/change-password
 * Changes the authenticated employee's password.
 * Requires an active session (auth middleware must run before this handler).
 */
export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { currentPassword, newPassword } = req.body;
  const employeeId = req.user!.employeeId;

  await service.changePassword(employeeId, currentPassword, newPassword);

  sendSuccess(res, null, "Contraseña actualizada correctamente");
}
