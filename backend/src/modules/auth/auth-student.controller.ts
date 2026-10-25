import { Request, Response } from "express";
import { AuthStudentService } from "./auth-student.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { env } from "../../shared/config/env.config";
import type { CookieConfig } from "./auth.types";

/**
 * Shared service instance used by all controller handlers.
 */
const service = new AuthStudentService(prisma, mailService);

/**
 * Build cookie options for the access_token cookie — same shape/name as the
 * employee auth controller (see modules/auth/auth.controller.ts); the two
 * sessions intentionally share the same cookie.
 */
function buildCookieOptions(): CookieConfig {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: "/",
    maxAge: service.parseExpirationToMs(env.JWT_ACCESS_EXPIRATION),
  };
}

/**
 * POST /auth/student/login
 * Authenticates a student by email/matrícula + password. Sets the
 * access_token HttpOnly cookie and returns the minimal student auth payload.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;
  const result = await service.login(username, password);

  const cookieOptions = buildCookieOptions();
  res.cookie("access_token", result.token, cookieOptions);

  sendSuccess(res, result.student);
}

/**
 * POST /auth/student/logout
 * Clears the access_token cookie to end the session on the client side.
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  const cookieOptions = buildCookieOptions();
  res.clearCookie("access_token", { ...cookieOptions, maxAge: 0 });

  sendSuccess(res, null);
}

/**
 * GET /auth/student/me
 * Returns the authenticated student's profile data. Requires a valid
 * access_token cookie (or Authorization header) issued for a student.
 */
export async function me(req: Request, res: Response): Promise<void> {
  const { studentId } = req.student!;
  const student = await service.getMe(studentId);
  sendSuccess(res, student);
}

/**
 * POST /auth/student/request-reset-password
 * Generates a new temporary password + 6-digit confirmation code and sends
 * both via email. Always responds 200 regardless of whether the email
 * exists (prevents account enumeration).
 */
export async function requestResetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body;
  await service.requestResetPassword(email);

  sendSuccess(res, null);
}

/**
 * POST /auth/student/reset-password
 * Completes the password reset for the authenticated student session:
 * verifies the 6-digit code emailed by requestResetPassword and sets the
 * final password.
 */
export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.student!;
  const { code, password } = req.body;

  await service.resetPassword(studentId, code, password);

  sendSuccess(res, null);
}
