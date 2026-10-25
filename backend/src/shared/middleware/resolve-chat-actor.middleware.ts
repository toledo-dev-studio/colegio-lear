import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "./auth.middleware";
import { authenticateStudent } from "./auth-student.middleware";

export type ChatActor =
  | { type: "student"; studentId: string }
  | { type: "teacher"; employeeId: string };

/**
 * Resolves whether an incoming chat request is a student or a teacher
 * (employee) session — used on the chat message routes, which serve BOTH
 * audiences from the exact same URL and the exact same controller function.
 *
 * Unlike gate-student-session.middleware.ts, there is no fallthrough to a
 * different router here: whichever audience the token belongs to, this
 * always fully authenticates (throwing UnauthorizedError on failure, same
 * as authenticate/authenticateStudent) and the caller continues handling
 * the request itself. Must be the only thing the route does before this
 * resolves, same reasoning as gateStudentSession — call it from inside a
 * single combined handler, not as chained middleware.
 *
 * Peeking at the unverified payload only decides which strict verifier to
 * run; a token that merely looks like a student's but fails real
 * verification throws from within authenticateStudent, it never silently
 * falls back to the employee check.
 */
export async function resolveChatActor(req: Request, res: Response): Promise<ChatActor> {
  const token =
    req.cookies?.access_token ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined);

  const decoded = token ? jwt.decode(token) : null;
  const looksLikeStudentToken =
    !!decoded && typeof decoded === "object" && "studentId" in decoded;

  if (looksLikeStudentToken) {
    await authenticateStudent(req, res, () => {});
    return { type: "student", studentId: req.student!.studentId };
  }

  await authenticate(req, res, () => {});
  return { type: "teacher", employeeId: req.user!.employeeId };
}
