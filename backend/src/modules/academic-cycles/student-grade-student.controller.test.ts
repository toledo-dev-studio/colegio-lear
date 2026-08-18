import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal grades handler. gateStudentSession,
 * prisma, and StudentGradeService are all mocked so this only exercises:
 * the ownership check (does this enrollment belong to the requesting
 * student?) and correct delegation to the shared service.
 */

vi.mock("../../shared/middleware/gate-student-session.middleware", () => ({
  gateStudentSession: vi.fn(),
}));

vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    academicCycleEnrollment: { findFirst: vi.fn() },
  },
}));

const { findAllByEnrollmentIdMock } = vi.hoisted(() => ({
  findAllByEnrollmentIdMock: vi.fn(),
}));
vi.mock("./student-grade.service", () => ({
  StudentGradeService: vi.fn().mockImplementation(function () {
    return { findAllByEnrollmentId: findAllByEnrollmentIdMock };
  }),
}));

import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { prisma } from "../../shared/lib/prisma";
import { findAllGrades } from "./student-grade-student.controller";

const ACADEMIC_CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const ENROLLMENT_ID = "22222222-2222-4222-8222-222222222222";
const STUDENT_ID = "33333333-3333-4333-8333-333333333333";

function buildReqRes() {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: {
      academicCycleId: ACADEMIC_CYCLE_ID,
      academicCycleEnrollmentId: ENROLLMENT_ID,
    },
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe("findAllGrades (student portal)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early (no response) when gateStudentSession falls through", async () => {
    (gateStudentSession as any).mockResolvedValue(false);
    const { req, res, next } = buildReqRes();

    await findAllGrades(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(prisma.academicCycleEnrollment.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the enrollment doesn't belong to the requesting student", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
    const { req, res, next } = buildReqRes();

    await expect(findAllGrades(req, res, next)).rejects.toThrow(NotFoundError);
    expect(findAllByEnrollmentIdMock).not.toHaveBeenCalled();
  });

  it("checks ownership scoped to the requesting student", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    findAllByEnrollmentIdMock.mockResolvedValue([]);
    const { req, res, next } = buildReqRes();

    await findAllGrades(req, res, next);

    expect(prisma.academicCycleEnrollment.findFirst).toHaveBeenCalledWith({
      where: {
        id: ENROLLMENT_ID,
        academicCycleId: ACADEMIC_CYCLE_ID,
        studentId: STUDENT_ID,
      },
      select: { id: true },
    });
  });

  it("delegates to StudentGradeService.findAllByEnrollmentId and returns its data", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    const grades = [{ id: "grade-1", grade: 9 }];
    findAllByEnrollmentIdMock.mockResolvedValue(grades);
    const { req, res, next } = buildReqRes();

    await findAllGrades(req, res, next);

    expect(findAllByEnrollmentIdMock).toHaveBeenCalledWith(
      ACADEMIC_CYCLE_ID,
      ENROLLMENT_ID,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(grades);
  });

  it("throws ValidationError when params aren't valid UUIDs", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    const { req, res, next } = buildReqRes();
    req.params = {
      academicCycleId: "not-a-uuid",
      academicCycleEnrollmentId: "also-not",
    };

    await expect(findAllGrades(req, res, next)).rejects.toThrow(
      ValidationError,
    );
  });
});
