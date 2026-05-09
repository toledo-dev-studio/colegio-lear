import { Request, Response } from "express";

import { sendSuccess } from "../../shared/helpers/response.helper";
import { login, refreshTokens, assignProfile } from "./auth.service";

/**
 * Handle employee login.
 * Validates credentials via the auth service and returns access + refresh tokens.
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  const tokens = await login(req.body.email, req.body.password);
  sendSuccess(res, tokens, "Login successful");
}

/**
 * Handle token refresh.
 * Rotates the refresh token and returns a new token pair.
 */
export async function refreshHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const tokens = await refreshTokens(req.body.refreshToken);
  sendSuccess(res, tokens, "Tokens refreshed");
}

/**
 * Handle profile assignment to an employee.
 * Delegates to the auth service to update the employee's profileId.
 */
export async function assignProfileHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await assignProfile(req.body.employeeId, req.body.profileId);
  sendSuccess(res, null, "Profile assigned");
}
