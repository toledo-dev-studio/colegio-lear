import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal tasks handler. No gate-student-session
 * is involved here (no employee-side URL collision) — authenticateStudent
 * runs as regular middleware upstream, so req.student is already set by the
 * time this handler runs. Prisma and SchoolSubjectTaskService are mocked.
 */

vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    academicCycleEnrollment: { findFirst: vi.fn() },
  },
}));

const { findAllPagedMock } = vi.hoisted(() => ({
  findAllPagedMock: vi.fn(),
}));
vi.mock("./school-subject-task.service", () => ({
  SchoolSubjectTaskService: vi.fn().mockImplementation(function () {
    return { findAllPaged: findAllPagedMock };
  }),
}));

import { prisma } from "../../shared/lib/prisma";
import { findAllPaged } from "./school-subject-task-student.controller";

const CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "44444444-4444-4444-8444-444444444444";
const STUDENT_ID = "33333333-3333-4333-8333-333333333333";

function buildReqRes(query: Record<string, unknown> = {}) {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: {
      academicCycleId: CYCLE_ID,
      academicCycleSchoolGroupId: GROUP_ID,
      academicCycleSchoolSubjectId: SUBJECT_ID,
    },
    query,
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  return { req, res };
}

describe("findAllPaged (student portal tasks)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NotFoundError when the group isn't the student's own", async () => {
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
    const { req, res } = buildReqRes();

    await expect(findAllPaged(req, res)).rejects.toThrow(NotFoundError);
    expect(findAllPagedMock).not.toHaveBeenCalled();
  });

  it("checks ownership scoped to the requesting student", async () => {
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    findAllPagedMock.mockResolvedValue({
      data: [],
      totalPages: 0,
      currentPage: 1,
      itemsCount: 0,
    });
    const { req, res } = buildReqRes();

    await findAllPaged(req, res);

    expect(prisma.academicCycleEnrollment.findFirst).toHaveBeenCalledWith({
      where: { studentId: STUDENT_ID, academicCycleId: CYCLE_ID, academicCycleSchoolGroupId: GROUP_ID },
      select: { id: true },
    });
  });

  it("defaults pageSize to 5 and delegates to the shared service", async () => {
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    const paged = { data: [{ id: "task-1" }], totalPages: 1, currentPage: 1, itemsCount: 1 };
    findAllPagedMock.mockResolvedValue(paged);
    const { req, res } = buildReqRes();

    await findAllPaged(req, res);

    expect(findAllPagedMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
      page: 1,
      pageSize: 5,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(paged);
  });

  it("honors explicit page/pageSize query params", async () => {
    (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
      id: "enrollment-uuid",
    });
    findAllPagedMock.mockResolvedValue({ data: [], totalPages: 0, currentPage: 2, itemsCount: 0 });
    const { req, res } = buildReqRes({ page: "2", pageSize: "10" });

    await findAllPaged(req, res);

    expect(findAllPagedMock).toHaveBeenCalledWith(CYCLE_ID, GROUP_ID, SUBJECT_ID, {
      page: 2,
      pageSize: 10,
    });
  });

  it("throws ValidationError when params aren't valid UUIDs", async () => {
    const { req, res } = buildReqRes();
    req.params = {
      academicCycleId: "not-a-uuid",
      academicCycleSchoolGroupId: "also-not",
      academicCycleSchoolSubjectId: "nope",
    };

    await expect(findAllPaged(req, res)).rejects.toThrow(ValidationError);
  });
});
