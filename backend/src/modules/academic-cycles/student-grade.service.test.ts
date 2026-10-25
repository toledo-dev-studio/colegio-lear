import { describe, it, expect, beforeEach, vi } from "vitest";
import { StudentGradeService } from "./student-grade.service";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for the teacher-facing write path added to StudentGradeService
 * (findAllByGroupAndSubject, upsert, remove) — findAllByEnrollmentId already
 * existed and is unchanged. PrismaClient is fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycleEnrollment: { findFirst: vi.fn() },
    studentGrade: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const GROUP_ID = "11111111-1111-4111-8111-111111111111";
const SUBJECT_ID = "22222222-2222-4222-8222-222222222222";
const ENROLLMENT_ID = "33333333-3333-4333-8333-333333333333";
const GRADE_ID = "44444444-4444-4444-8444-444444444444";

const BASE_GRADE_ROW = {
  id: GRADE_ID,
  grade: "7.80",
  evaluationNumber: 1,
  schoolSubjectId: SUBJECT_ID,
  schoolSubject: { id: SUBJECT_ID, name: "Español", description: null },
  academicCycleEnrollmentId: ENROLLMENT_ID,
};

describe("StudentGradeService — teacher write path", () => {
  let prisma: MockPrisma;
  let service: StudentGradeService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new StudentGradeService(prisma as any);
  });

  describe("findAllByGroupAndSubject", () => {
    it("filters by subject and the enrollment's group", async () => {
      prisma.studentGrade.findMany.mockResolvedValue([BASE_GRADE_ROW]);

      const result = await service.findAllByGroupAndSubject(GROUP_ID, SUBJECT_ID);

      expect(prisma.studentGrade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            schoolSubjectId: SUBJECT_ID,
            academicCycleEnrollment: { academicCycleSchoolGroupId: GROUP_ID },
          },
        }),
      );
      expect(result[0]!.grade).toBe(7.8);
    });
  });

  describe("upsert", () => {
    it("throws NotFoundError when the enrollment isn't in this group", async () => {
      prisma.academicCycleEnrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.upsert(GROUP_ID, SUBJECT_ID, {
          academicCycleEnrollmentId: ENROLLMENT_ID,
          evaluationNumber: 1,
          grade: 8,
        }),
      ).rejects.toThrow(NotFoundError);
      expect(prisma.studentGrade.upsert).not.toHaveBeenCalled();
    });

    it("upserts keyed on the compound unique constraint", async () => {
      prisma.academicCycleEnrollment.findFirst.mockResolvedValue({ id: ENROLLMENT_ID });
      prisma.studentGrade.upsert.mockResolvedValue(BASE_GRADE_ROW);

      await service.upsert(GROUP_ID, SUBJECT_ID, {
        academicCycleEnrollmentId: ENROLLMENT_ID,
        evaluationNumber: 1,
        grade: 7.8,
      });

      expect(prisma.studentGrade.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            academicCycleEnrollmentId_schoolSubjectId_evaluationNumber: {
              academicCycleEnrollmentId: ENROLLMENT_ID,
              schoolSubjectId: SUBJECT_ID,
              evaluationNumber: 1,
            },
          },
          create: {
            academicCycleEnrollmentId: ENROLLMENT_ID,
            schoolSubjectId: SUBJECT_ID,
            evaluationNumber: 1,
            grade: 7.8,
          },
          update: { grade: 7.8 },
        }),
      );
    });
  });

  describe("remove", () => {
    it("throws NotFoundError when the grade doesn't exist or isn't in this group", async () => {
      prisma.studentGrade.findFirst.mockResolvedValue(null);

      await expect(service.remove(GROUP_ID, GRADE_ID)).rejects.toThrow(NotFoundError);
      expect(prisma.studentGrade.delete).not.toHaveBeenCalled();
    });

    it("deletes the grade when it belongs to this group", async () => {
      prisma.studentGrade.findFirst.mockResolvedValue(BASE_GRADE_ROW);

      await service.remove(GROUP_ID, GRADE_ID);

      expect(prisma.studentGrade.findFirst).toHaveBeenCalledWith({
        where: { id: GRADE_ID, academicCycleEnrollment: { academicCycleSchoolGroupId: GROUP_ID } },
      });
      expect(prisma.studentGrade.delete).toHaveBeenCalledWith({ where: { id: GRADE_ID } });
    });
  });
});
