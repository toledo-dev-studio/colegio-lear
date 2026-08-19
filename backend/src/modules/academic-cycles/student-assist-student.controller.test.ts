import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal attendance handler. gateStudentSession,
 * prisma, and StudentAssistService are all mocked so this only exercises:
 * the ownership check and correct delegation to the shared service.
 */

vi.mock("../../shared/middleware/gate-student-session.middleware", () => ({
  gateStudentSession: vi.fn(),
}));

vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    academicCycleEnrollment: { findFirst: vi.fn() },
  },
}));

const { findAllPagedMock } = vi.hoisted(() => ({
  findAllPagedMock: vi.fn(),
}));
vi.mock("./student-assist.service", () => ({
  StudentAssistService: vi.fn().mockImplementation(function () {
    return { findAllPaged: findAllPagedMock };
  }),
}));

import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { prisma } from "../../shared/lib/prisma";
import { findAllPaged } from "./student-assist-student.controller";

const ACADEMIC_CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const ENROLLMENT_ID = "22222222-2222-4222-8222-222222222222";
const STUDENT_ID = "33333333-3333-4333-8333-333333333333";

function buildReqRes(query: Record<string, unknown> = {}) {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: {
      academicCycleId: ACADEMIC_CYCLE_ID,
      academicCycleEnrollmentId: ENROLLMENT_ID,
    },
    query,
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe("findAllPaged (student portal assists)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early (no response) when gateStudentSession falls through", async () => {
    (gateStudentSession as any).mockResolvedValue(false);
    const { req, res, next } = buildReqRes();

    await findAllPaged(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(prisma.academicCycleEnrollment.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the enrollment doesn't belong to the requesting student", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
    const { req, res, next } = buildReqRes();

    await expect(findAllPaged(req, res, next)).rejects.toThrow(NotFoundError);
    expect(findAllPagedMock).not.toHaveBeenCalled();
  });

  it("checks ownership scoped to the requesting student", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: ENROLLMENT_ID,
    });
    findAllPagedMock.mockResolvedValue({ data: [], totalPages: 0, currentPage: 1, itemsCount: 0 });
    const { req, res, next } = buildReqRes();

    await findAllPaged(req, res, next);

    expect(prisma.academicCycleEnrollment.findFirst).toHaveBeenCalledWith({
      where: {
        id: ENROLLMENT_ID,
        academicCycleId: ACADEMIC_CYCLE_ID,
        studentId: STUDENT_ID,
      },
      select: { id: true },
    });
  });

  it("defaults pageSize to 10 and passes no date filter when omitted", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: ENROLLMENT_ID,
    });
    const paged = { data: [{ id: "assist-1" }], totalPages: 1, currentPage: 1, itemsCount: 1 };
    findAllPagedMock.mockResolvedValue(paged);
    const { req, res, next } = buildReqRes();

    await findAllPaged(req, res, next);

    expect(findAllPagedMock).toHaveBeenCalledWith(
      ACADEMIC_CYCLE_ID,
      ENROLLMENT_ID,
      {},
      { page: 1, pageSize: 10 },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(paged);
  });

  it("forwards fromDate/toDate when provided", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: ENROLLMENT_ID,
    });
    findAllPagedMock.mockResolvedValue({ data: [], totalPages: 0, currentPage: 1, itemsCount: 0 });
    const { req, res, next } = buildReqRes({ fromDate: "2026-09-01", toDate: "2026-09-07" });

    await findAllPaged(req, res, next);

    expect(findAllPagedMock).toHaveBeenCalledWith(
      ACADEMIC_CYCLE_ID,
      ENROLLMENT_ID,
      { fromDate: "2026-09-01", toDate: "2026-09-07" },
      { page: 1, pageSize: 10 },
    );
  });

  it("throws ValidationError when params aren't valid UUIDs", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    const { req, res, next } = buildReqRes();
    req.params = { academicCycleId: "not-a-uuid", academicCycleEnrollmentId: "also-not" };

    await expect(findAllPaged(req, res, next)).rejects.toThrow(ValidationError);
  });
});
