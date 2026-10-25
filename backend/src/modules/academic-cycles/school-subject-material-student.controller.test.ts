import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal materials handler. This URL collides
 * with the employee CRUD route (same GET .../materials), so
 * gateStudentSession, prisma, and SchoolSubjectMaterialService are all
 * mocked to exercise: the fallthrough branch, the ownership check, and
 * correct delegation to the shared service.
 */

vi.mock("../../shared/middleware/gate-student-session.middleware", () => ({
  gateStudentSession: vi.fn(),
}));

vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    academicCycleEnrollment: { findFirst: vi.fn() },
  },
}));

const { findAllMock } = vi.hoisted(() => ({
  findAllMock: vi.fn(),
}));
vi.mock("./school-subject-material.service", () => ({
  SchoolSubjectMaterialService: vi.fn().mockImplementation(function () {
    return { findAll: findAllMock };
  }),
}));

import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { prisma } from "../../shared/lib/prisma";
import { findAll } from "./school-subject-material-student.controller";

const CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "44444444-4444-4444-8444-444444444444";
const STUDENT_ID = "33333333-3333-4333-8333-333333333333";

function buildReqRes() {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: {
      academicCycleId: CYCLE_ID,
      academicCycleSchoolGroupId: GROUP_ID,
      academicCycleSchoolSubjectId: SUBJECT_ID,
    },
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe("findAll (student portal materials)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early (no response) when gateStudentSession falls through", async () => {
    (gateStudentSession as any).mockResolvedValue(false);
    const { req, res, next } = buildReqRes();

    await findAll(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(prisma.academicCycleEnrollment.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the group isn't the student's own", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
    const { req, res, next } = buildReqRes();

    await expect(findAll(req, res, next)).rejects.toThrow(NotFoundError);
    expect(findAllMock).not.toHaveBeenCalled();
  });

  it("delegates to the shared service and returns its data", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    const materials = [{ id: "material-1" }];
    findAllMock.mockResolvedValue(materials);
    const { req, res, next } = buildReqRes();

    await findAll(req, res, next);

    expect(findAllMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, SUBJECT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(materials);
  });

  it("throws ValidationError when params aren't valid UUIDs", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    const { req, res, next } = buildReqRes();
    req.params = {
      academicCycleId: "not-a-uuid",
      academicCycleSchoolGroupId: "also-not",
      academicCycleSchoolSubjectId: "nope",
    };

    await expect(findAll(req, res, next)).rejects.toThrow(ValidationError);
  });
});
