import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";

/**
 * Unit tests for resolveChatActor — verifies it picks the right real
 * verifier (authenticate vs authenticateStudent) based on an unverified
 * peek at the token payload, and returns the matching actor shape.
 */

const { authenticateMock, authenticateStudentMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  authenticateStudentMock: vi.fn(),
}));
vi.mock("./auth.middleware", () => ({ authenticate: authenticateMock }));
vi.mock("./auth-student.middleware", () => ({ authenticateStudent: authenticateStudentMock }));

import { resolveChatActor } from "./resolve-chat-actor.middleware";

function buildReq(token?: string) {
  return {
    cookies: token ? { access_token: token } : {},
    headers: {},
  } as any;
}

const res = {} as any;

describe("resolveChatActor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves a student actor when the token looks like a student's", async () => {
    const token = jwt.sign({ studentId: "student-uuid", email: "a@b.com" }, "irrelevant-for-decode");
    authenticateStudentMock.mockImplementation(async (req: any) => {
      req.student = { studentId: "student-uuid", email: "a@b.com" };
    });
    const req = buildReq(token);

    const actor = await resolveChatActor(req, res);

    expect(authenticateStudentMock).toHaveBeenCalled();
    expect(authenticateMock).not.toHaveBeenCalled();
    expect(actor).toEqual({ type: "student", studentId: "student-uuid" });
  });

  it("resolves a teacher actor when the token looks like an employee's", async () => {
    const token = jwt.sign(
      { employeeId: "employee-uuid", email: "a@b.com", securityRoleId: "role-uuid" },
      "irrelevant-for-decode",
    );
    authenticateMock.mockImplementation(async (req: any) => {
      req.user = { employeeId: "employee-uuid", email: "a@b.com", securityRoleId: "role-uuid", permissions: [] };
    });
    const req = buildReq(token);

    const actor = await resolveChatActor(req, res);

    expect(authenticateMock).toHaveBeenCalled();
    expect(authenticateStudentMock).not.toHaveBeenCalled();
    expect(actor).toEqual({ type: "teacher", employeeId: "employee-uuid" });
  });

  it("falls through to authenticate (which throws) when there is no token at all", async () => {
    authenticateMock.mockImplementation(async () => {
      throw new Error("Access token is required");
    });
    const req = buildReq(undefined);

    await expect(resolveChatActor(req, res)).rejects.toThrow("Access token is required");
    expect(authenticateStudentMock).not.toHaveBeenCalled();
  });
});
