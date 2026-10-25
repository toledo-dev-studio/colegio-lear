import { describe, it, expect, beforeEach, vi } from "vitest";
import { gateStudentSession } from "./gate-student-session.middleware";
import { UnauthorizedError } from "../errors/app-error";

/**
 * Unit tests for gateStudentSession — the "peek then delegate" mechanism
 * that lets a student-portal route share its exact URL with an
 * employee-facing route (see academic-cycle-school-group-student.routes.ts
 * for the first real usage). jsonwebtoken and authenticateStudent are
 * mocked so this only exercises the decision logic itself.
 */

vi.mock("jsonwebtoken", () => ({
  default: { decode: vi.fn() },
}));

vi.mock("./auth-student.middleware", () => ({
  authenticateStudent: vi.fn(),
}));

import jwt from "jsonwebtoken";
import { authenticateStudent } from "./auth-student.middleware";

function buildReq(overrides: Record<string, unknown> = {}) {
  return {
    cookies: {},
    headers: {},
    ...overrides,
  } as any;
}

describe("gateStudentSession", () => {
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  it("falls through (calls next, returns false) when there is no token at all", async () => {
    const req = buildReq();

    const result = await gateStudentSession(req, {} as any, next as any);

    expect(result).toBe(false);
    expect(next).toHaveBeenCalledTimes(1);
    expect(authenticateStudent).not.toHaveBeenCalled();
  });

  it("falls through when the cookie decodes to an employee-shaped payload", async () => {
    const req = buildReq({ cookies: { access_token: "employee.jwt.token" } });
    (jwt.decode as any).mockReturnValue({
      employeeId: "emp-uuid",
      securityRoleId: "role-uuid",
    });

    const result = await gateStudentSession(req, {} as any, next as any);

    expect(result).toBe(false);
    expect(next).toHaveBeenCalledTimes(1);
    expect(authenticateStudent).not.toHaveBeenCalled();
  });

  it("falls through when the token doesn't decode to an object at all", async () => {
    const req = buildReq({ cookies: { access_token: "garbage" } });
    (jwt.decode as any).mockReturnValue(null);

    const result = await gateStudentSession(req, {} as any, next as any);

    expect(result).toBe(false);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("delegates to authenticateStudent and returns true when the payload looks like a student token", async () => {
    const req = buildReq({ cookies: { access_token: "student.jwt.token" } });
    (jwt.decode as any).mockReturnValue({
      studentId: "student-uuid",
      email: "a@b.com",
    });
    (authenticateStudent as any).mockImplementation(
      async (r: any, _res: any, n: () => void) => {
        r.student = { studentId: "student-uuid", email: "a@b.com" };
        n();
      },
    );

    const result = await gateStudentSession(req, {} as any, next as any);

    expect(result).toBe(true);
    expect(req.student).toEqual({ studentId: "student-uuid", email: "a@b.com" });
    // The route's own `next` must never be called on the success path —
    // control stays with the caller instead of escaping to the employee router.
    expect(next).not.toHaveBeenCalled();
  });

  it("does NOT fall through when a student-shaped token fails real verification (throws instead)", async () => {
    const req = buildReq({ cookies: { access_token: "expired.student.token" } });
    (jwt.decode as any).mockReturnValue({ studentId: "student-uuid" });
    (authenticateStudent as any).mockRejectedValue(
      new UnauthorizedError("Access token has expired"),
    );

    await expect(gateStudentSession(req, {} as any, next as any)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("reads the token from the Authorization header when there is no cookie", async () => {
    const req = buildReq({ headers: { authorization: "Bearer student.jwt.token" } });
    (jwt.decode as any).mockReturnValue({ studentId: "student-uuid" });
    (authenticateStudent as any).mockImplementation(
      async (r: any, _res: any, n: () => void) => {
        r.student = { studentId: "student-uuid", email: "a@b.com" };
        n();
      },
    );

    const result = await gateStudentSession(req, {} as any, next as any);

    expect(result).toBe(true);
    expect(jwt.decode).toHaveBeenCalledWith("student.jwt.token");
  });
});
