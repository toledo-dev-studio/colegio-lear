import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Unit tests for the teacher-facing grades controller.
 * resolveTeacherSubjectScope and StudentGradeService are mocked so this only
 * exercises delegation and that the ownership gate runs before every write.
 */

vi.mock("./teacher-class-scope.helper", () => ({
  resolveTeacherSubjectScope: vi.fn(),
}));

const { findAllByGroupAndSubjectMock, upsertMock, removeMock } = vi.hoisted(() => ({
  findAllByGroupAndSubjectMock: vi.fn(),
  upsertMock: vi.fn(),
  removeMock: vi.fn(),
}));
vi.mock("./student-grade.service", () => ({
  StudentGradeService: vi.fn().mockImplementation(function () {
    return {
      findAllByGroupAndSubject: findAllByGroupAndSubjectMock,
      upsert: upsertMock,
      remove: removeMock,
    };
  }),
}));

import { resolveTeacherSubjectScope } from "./teacher-class-scope.helper";
import { findAll, upsert, remove } from "./student-grade-teacher.controller";

const EMPLOYEE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "33333333-3333-4333-8333-333333333333";
const ENROLLMENT_ID = "44444444-4444-4444-8444-444444444444";
const GRADE_ID = "55555555-5555-4555-8555-555555555555";

function buildReqRes(body: unknown = {}) {
  const req = {
    user: { employeeId: EMPLOYEE_ID },
    params: { schoolGroupId: GROUP_ID, schoolSubjectId: SUBJECT_ID },
    body,
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any;
  return { req, res };
}

describe("student-grade-teacher.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (resolveTeacherSubjectScope as any).mockResolvedValue({});
  });

  it("findAll verifies ownership before delegating", async () => {
    findAllByGroupAndSubjectMock.mockResolvedValue([{ id: GRADE_ID }]);
    const { req, res } = buildReqRes();

    await findAll(req, res);

    expect(resolveTeacherSubjectScope).toHaveBeenCalledWith(
      expect.anything(),
      EMPLOYEE_ID,
      GROUP_ID,
      SUBJECT_ID,
    );
    expect(findAllByGroupAndSubjectMock).toHaveBeenCalledWith(GROUP_ID, SUBJECT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("upsert verifies ownership before delegating", async () => {
    upsertMock.mockResolvedValue({ id: GRADE_ID });
    const { req, res } = buildReqRes({
      academicCycleEnrollmentId: ENROLLMENT_ID,
      evaluationNumber: 1,
      grade: 8.5,
    });

    await upsert(req, res);

    expect(resolveTeacherSubjectScope).toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalledWith(GROUP_ID, SUBJECT_ID, {
      academicCycleEnrollmentId: ENROLLMENT_ID,
      evaluationNumber: 1,
      grade: 8.5,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("remove verifies ownership before delegating", async () => {
    const { req, res } = buildReqRes();
    req.params.gradeId = GRADE_ID;

    await remove(req, res);

    expect(resolveTeacherSubjectScope).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith(GROUP_ID, GRADE_ID);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
