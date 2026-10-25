import { describe, it, expect, beforeEach, vi } from "vitest";
import { resolveTeacherSubjectScope, resolveTeacherGroupScope } from "./teacher-class-scope.helper";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for resolveTeacherSubjectScope — the shared "does this teacher
 * teach this subject in this class" check reused by tasks, materials, and
 * (later) grades. PrismaClient is fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycleGroup: { findUnique: vi.fn(), findFirst: vi.fn() },
    academicCycleSchoolSubject: { findFirst: vi.fn() },
    academicCycleGroupCalendar: { findFirst: vi.fn() },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const TEACHER_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "33333333-3333-4333-8333-333333333333";
const CYCLE_ID = "44444444-4444-4444-8444-444444444444";
const CYCLE_SUBJECT_ID = "55555555-5555-4555-8555-555555555555";

describe("resolveTeacherSubjectScope", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("throws NotFoundError when the class doesn't exist", async () => {
    prisma.academicCycleGroup.findUnique.mockResolvedValue(null);

    await expect(
      resolveTeacherSubjectScope(prisma as any, TEACHER_ID, GROUP_ID, SUBJECT_ID),
    ).rejects.toThrow(NotFoundError);
    expect(prisma.academicCycleSchoolSubject.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the subject isn't in this academic cycle", async () => {
    prisma.academicCycleGroup.findUnique.mockResolvedValue({ academicCycleId: CYCLE_ID });
    prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue(null);

    await expect(
      resolveTeacherSubjectScope(prisma as any, TEACHER_ID, GROUP_ID, SUBJECT_ID),
    ).rejects.toThrow(NotFoundError);
    expect(prisma.academicCycleGroupCalendar.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the teacher doesn't teach this subject in this group", async () => {
    prisma.academicCycleGroup.findUnique.mockResolvedValue({ academicCycleId: CYCLE_ID });
    prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue({ id: CYCLE_SUBJECT_ID });
    prisma.academicCycleGroupCalendar.findFirst.mockResolvedValue(null);

    await expect(
      resolveTeacherSubjectScope(prisma as any, TEACHER_ID, GROUP_ID, SUBJECT_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it("resolves the academicCycleId and academicCycleSchoolSubjectId when the teacher is assigned", async () => {
    prisma.academicCycleGroup.findUnique.mockResolvedValue({ academicCycleId: CYCLE_ID });
    prisma.academicCycleSchoolSubject.findFirst.mockResolvedValue({ id: CYCLE_SUBJECT_ID });
    prisma.academicCycleGroupCalendar.findFirst.mockResolvedValue({ id: "calendar-1" });

    const result = await resolveTeacherSubjectScope(
      prisma as any,
      TEACHER_ID,
      GROUP_ID,
      SUBJECT_ID,
    );

    expect(result).toEqual({
      academicCycleId: CYCLE_ID,
      academicCycleSchoolSubjectId: CYCLE_SUBJECT_ID,
    });
    expect(prisma.academicCycleGroupCalendar.findFirst).toHaveBeenCalledWith({
      where: {
        teacherId: TEACHER_ID,
        academicCycleSchoolGroupId: GROUP_ID,
        academicCycleSchoolSubjectId: CYCLE_SUBJECT_ID,
      },
      select: { id: true },
    });
  });
});

describe("resolveTeacherGroupScope", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("throws NotFoundError when the group isn't in this academic cycle", async () => {
    prisma.academicCycleGroup.findFirst.mockResolvedValue(null);

    await expect(
      resolveTeacherGroupScope(prisma as any, TEACHER_ID, CYCLE_ID, GROUP_ID),
    ).rejects.toThrow(NotFoundError);
    expect(prisma.academicCycleGroupCalendar.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the teacher teaches nothing in this group", async () => {
    prisma.academicCycleGroup.findFirst.mockResolvedValue({ id: GROUP_ID });
    prisma.academicCycleGroupCalendar.findFirst.mockResolvedValue(null);

    await expect(
      resolveTeacherGroupScope(prisma as any, TEACHER_ID, CYCLE_ID, GROUP_ID),
    ).rejects.toThrow(NotFoundError);
  });

  it("resolves without throwing when the teacher teaches any subject in the group", async () => {
    prisma.academicCycleGroup.findFirst.mockResolvedValue({ id: GROUP_ID });
    prisma.academicCycleGroupCalendar.findFirst.mockResolvedValue({ id: "calendar-1" });

    await expect(
      resolveTeacherGroupScope(prisma as any, TEACHER_ID, CYCLE_ID, GROUP_ID),
    ).resolves.toBeUndefined();
    expect(prisma.academicCycleGroupCalendar.findFirst).toHaveBeenCalledWith({
      where: { teacherId: TEACHER_ID, academicCycleSchoolGroupId: GROUP_ID },
      select: { id: true },
    });
  });
});
