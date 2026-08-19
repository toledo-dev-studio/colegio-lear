import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateStudent } from "./auth-student.middleware";

/**
 * Decides, without fully verifying the token, whether an incoming request
 * belongs to a student session — used at the top of a route handler on a
 * "shared URL" router that must serve both the employee panel
 * (authenticate/authorize, mounted afterward in index.ts) and the student
 * portal from the exact same path (e.g.
 * GET /academic-cycles/:id/school-groups/:id/calendars).
 *
 * IMPORTANT: must be the only thing that route does before this returns —
 * it calls the route's own `next` on the "not a student" branch, and in
 * Express that only escapes to the *next app-level middleware* (here, the
 * employee router mounted after this one in index.ts) when it's the last
 * handler in the route's stack. Chaining further middleware after this one
 * on the same route (e.g. router.get(path, gateStudentSession, validate,
 * controller)) would break the fallthrough — next() would just advance to
 * the next handler in *this* route's stack instead of escaping to the
 * employee router. Call this from inside a single combined handler instead
 * (see academic-cycle-school-group-student.controller.ts for the pattern).
 *
 * Resolves to:
 *   - false — no access_token cookie, or the decoded payload has no
 *     `studentId` (an employee token, or garbage). Already called next();
 *     the caller must return immediately without touching req/res further.
 *   - true — the token looked like a student token AND passed real
 *     signature+expiration verification (delegated to authenticateStudent,
 *     which also sets req.student). The caller should continue handling
 *     the request itself.
 *
 * Never trusts the unverified peek for anything except which strict
 * verifier to run next — if the peek looks like a student token but fails
 * real verification, authenticateStudent throws (401) and does NOT fall
 * through to the employee router, since the intent was clearly a student
 * session.
 */
export async function gateStudentSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<boolean> {
  const token =
    req.cookies?.access_token ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    next();
    return false;
  }

  const decoded = jwt.decode(token);
  const looksLikeStudentToken =
    !!decoded && typeof decoded === "object" && "studentId" in decoded;

  if (!looksLikeStudentToken) {
    next();
    return false;
  }

  // Pass a no-op `next` — on success authenticateStudent sets req.student
  // and calls it; we want to keep control here and continue synchronously
  // rather than hand off to Express's next layer. On failure it throws,
  // which propagates out of this await (Express 5 catches async throws).
  await authenticateStudent(req, res, () => {});
  return true;
}
