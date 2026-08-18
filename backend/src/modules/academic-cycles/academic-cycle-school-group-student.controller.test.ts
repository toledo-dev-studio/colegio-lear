import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal school-group handlers. gateStudentSession,
 * prisma, and AcademicCycleSchoolGroupService are all mocked so this only
 * exercises: the ownership check (does the group belong to this student's
 * own enrollment?) and correct delegation to the shared service.
 */

vi.mock("../../shared/middleware/gate-student-session.middleware", () => ({
  gateStudentSession: vi.fn(),
}));

vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    academicCycleEnrollment: { findFirst: vi.fn() },
  },
}));

const { findAllCalendarsMock, findAllTeachersMock } = vi.hoisted(() => ({
  findAllCalendarsMock: vi.fn(),
  findAllTeachersMock: vi.fn(),
}));
vi.mock("./academic-cycle-school-group.service", () => ({
  AcademicCycleSchoolGroupService: vi.fn().mockImplementation(function () {
    return {
      findAllCalendars: findAllCalendarsMock,
      findAllTeachers: findAllTeachersMock,
    };
  }),
}));

import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { prisma } from "../../shared/lib/prisma";
import { findAllCalendars, findAllTeachers } from "./academic-cycle-school-group-student.controller";

const ACADEMIC_CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const STUDENT_ID = "33333333-3333-4333-8333-333333333333";

function buildReqRes() {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: {
      academicCycleId: ACADEMIC_CYCLE_ID,
      academicCycleSchoolGroupId: GROUP_ID,
    },
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe("student school-group handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAllCalendars", () => {
    it("returns early (no response) when gateStudentSession falls through", async () => {
      (gateStudentSession as any).mockResolvedValue(false);
      const { req, res, next } = buildReqRes();

      await findAllCalendars(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(prisma.academicCycleEnrollment.findFirst).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the group doesn't belong to the student's own enrollment", async () => {
      (gateStudentSession as any).mockResolvedValue(true);
      (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
      const { req, res, next } = buildReqRes();

      await expect(findAllCalendars(req, res, next)).rejects.toThrow(
        NotFoundError,
      );
      expect(findAllCalendarsMock).not.toHaveBeenCalled();
    });

    it("checks ownership scoped to the requesting student", async () => {
      (gateStudentSession as any).mockResolvedValue(true);
      (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
        id: "enrollment-uuid",
      });
      findAllCalendarsMock.mockResolvedValue([]);
      const { req, res, next } = buildReqRes();

      await findAllCalendars(req, res, next);

      expect(prisma.academicCycleEnrollment.findFirst).toHaveBeenCalledWith({
        where: {
          studentId: STUDENT_ID,
          academicCycleId: ACADEMIC_CYCLE_ID,
          academicCycleSchoolGroupId: GROUP_ID,
        },
        select: { id: true },
      });
    });

    it("delegates to AcademicCycleSchoolGroupService.findAllCalendars and returns its data", async () => {
      (gateStudentSession as any).mockResolvedValue(true);
      (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
        id: "enrollment-uuid",
      });
      const calendars = [{ id: "cal-1" }];
      findAllCalendarsMock.mockResolvedValue(calendars);
      const { req, res, next } = buildReqRes();

      await findAllCalendars(req, res, next);

      expect(findAllCalendarsMock).toHaveBeenCalledWith(
        ACADEMIC_CYCLE_ID,
        GROUP_ID,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(calendars);
    });

    it("throws ValidationError when params aren't valid UUIDs", async () => {
      (gateStudentSession as any).mockResolvedValue(true);
      const { req, res, next } = buildReqRes();
      req.params = { academicCycleId: "not-a-uuid", academicCycleSchoolGroupId: "also-not" };

      await expect(findAllCalendars(req, res, next)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("findAllTeachers", () => {
    it("returns early when gateStudentSession falls through", async () => {
      (gateStudentSession as any).mockResolvedValue(false);
      const { req, res, next } = buildReqRes();

      await findAllTeachers(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the group isn't the student's own", async () => {
      (gateStudentSession as any).mockResolvedValue(true);
      (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue(null);
      const { req, res, next } = buildReqRes();

      await expect(findAllTeachers(req, res, next)).rejects.toThrow(
        NotFoundError,
      );
      expect(findAllTeachersMock).not.toHaveBeenCalled();
    });

    it("always queries with includeInactive=false, regardless of query string", async () => {
      (gateStudentSession as any).mockResolvedValue(true);
      (prisma.academicCycleEnrollment.findFirst as any).mockResolvedValue({
        id: "enrollment-uuid",
      });
      findAllTeachersMock.mockResolvedValue([]);
      const { req, res, next } = buildReqRes();
      req.query = { includeInactive: "true" }; // must be ignored for students

      await findAllTeachers(req, res, next);

      expect(findAllTeachersMock).toHaveBeenCalledWith(
        ACADEMIC_CYCLE_ID,
        GROUP_ID,
        false,
      );
    });
  });
});
