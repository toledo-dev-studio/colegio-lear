import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Unit tests for the teacher-facing group attendance controller.
 * resolveTeacherGroupScope and StudentAssistService are mocked so this only
 * exercises delegation and that the (group-level, not subject-level)
 * ownership gate runs before every call.
 */

vi.mock("./teacher-class-scope.helper", () => ({
  resolveTeacherGroupScope: vi.fn(),
}));

const { findAllByGroupAndDayMock, upsertManyForGroupMock } = vi.hoisted(() => ({
  findAllByGroupAndDayMock: vi.fn(),
  upsertManyForGroupMock: vi.fn(),
}));
vi.mock("./student-assist.service", () => ({
  StudentAssistService: vi.fn().mockImplementation(function () {
    return {
      findAllByGroupAndDay: findAllByGroupAndDayMock,
      upsertManyForGroup: upsertManyForGroupMock,
    };
  }),
}));

import { resolveTeacherGroupScope } from "./teacher-class-scope.helper";
import { findAllByGroupAndDay, upsertMany } from "./student-assist-teacher.controller";

const EMPLOYEE_ID = "11111111-1111-4111-8111-111111111111";
const CYCLE_ID = "22222222-2222-4222-8222-222222222222";
const GROUP_ID = "33333333-3333-4333-8333-333333333333";
const ENROLLMENT_ID = "44444444-4444-4444-8444-444444444444";

function buildReqRes(options: { query?: unknown; body?: unknown } = {}) {
  const req = {
    user: { employeeId: EMPLOYEE_ID },
    params: { academicCycleId: CYCLE_ID, schoolGroupId: GROUP_ID },
    query: options.query ?? {},
    body: options.body ?? {},
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  return { req, res };
}

describe("student-assist-teacher.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (resolveTeacherGroupScope as any).mockResolvedValue(undefined);
  });

  it("findAllByGroupAndDay verifies group ownership before delegating", async () => {
    findAllByGroupAndDayMock.mockResolvedValue([]);
    const { req, res } = buildReqRes({ query: { assistDate: "2026-09-10" } });

    await findAllByGroupAndDay(req, res);

    expect(resolveTeacherGroupScope).toHaveBeenCalledWith(
      expect.anything(),
      EMPLOYEE_ID,
      CYCLE_ID,
      GROUP_ID,
    );
    expect(findAllByGroupAndDayMock).toHaveBeenCalledWith(GROUP_ID, "2026-09-10");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("upsertMany verifies group ownership before delegating", async () => {
    upsertManyForGroupMock.mockResolvedValue([]);
    const { req, res } = buildReqRes({
      body: {
        assistDate: "2026-09-10",
        assists: [{ academicCycleEnrollmentId: ENROLLMENT_ID, status: "present" }],
      },
    });

    await upsertMany(req, res);

    expect(resolveTeacherGroupScope).toHaveBeenCalled();
    expect(upsertManyForGroupMock).toHaveBeenCalledWith(GROUP_ID, "2026-09-10", [
      { academicCycleEnrollmentId: ENROLLMENT_ID, status: "present" },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
