import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal materials handler — same shape as the
 * tasks student controller test, no gate-student-session involved.
 */

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
  return { req, res };
}

describe("findAll (student portal materials)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NotFoundError when the group isn't the student's own", async () => {
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
    const { req, res } = buildReqRes();

    await expect(findAll(req, res)).rejects.toThrow(NotFoundError);
    expect(findAllMock).not.toHaveBeenCalled();
  });

  it("delegates to the shared service and returns its data", async () => {
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    const materials = [{ id: "material-1" }];
    findAllMock.mockResolvedValue(materials);
    const { req, res } = buildReqRes();

    await findAll(req, res);

    expect(findAllMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, SUBJECT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(materials);
  });

  it("throws ValidationError when params aren't valid UUIDs", async () => {
    const { req, res } = buildReqRes();
    req.params = {
      academicCycleId: "not-a-uuid",
      academicCycleSchoolGroupId: "also-not",
      academicCycleSchoolSubjectId: "nope",
    };

    await expect(findAll(req, res)).rejects.toThrow(ValidationError);
  });
});
