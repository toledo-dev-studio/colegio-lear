import { describe, it, expect, beforeEach, vi } from "vitest";
import { AcademicCycleSchoolGroupService } from "./academic-cycle-school-group.service";

/**
 * Unit tests for AcademicCycleSchoolGroupService.findAllTeachers — covers
 * the academicCycleSchoolSubjectId field (previously missing from the
 * response despite always being available on the raw calendar row).
 * PrismaClient is fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycle: { findUnique: vi.fn() },
    academicCycleGroup: { findFirst: vi.fn() },
    academicCycleGroupCalendar: { findMany: vi.fn() },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const SUBJECT_ID = "33333333-3333-4333-8333-333333333333";
const CYCLE_SUBJECT_ID = "44444444-4444-4444-8444-444444444444";
const TEACHER_ID = "55555555-5555-4555-8555-555555555555";

const CALENDAR_ROW = {
  id: "calendar-1",
  day: "monday",
  startTime: new Date("1970-01-01T08:00:00.000Z"),
  endTime: new Date("1970-01-01T09:00:00.000Z"),
  academicCycleId: CYCLE_ID,
  academicCycleSchoolGroupId: GROUP_ID,
  academicCycleSchoolSubjectId: CYCLE_SUBJECT_ID,
  academicCycleSchoolSubject: {
    schoolSubjectId: SUBJECT_ID,
    schoolSubject: { id: SUBJECT_ID, name: "Español", description: null },
  },
  teacherId: TEACHER_ID,
  teacher: {
    id: TEACHER_ID,
    name: "Laura",
    firstLastName: "Fernández",
    avatar: null,
    jobTitle: { jobTitleType: "teacher" },
  },
};

describe("AcademicCycleSchoolGroupService.findAllTeachers", () => {
  let prisma: MockPrisma;
  let service: AcademicCycleSchoolGroupService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new AcademicCycleSchoolGroupService(prisma as any);
    prisma.academicCycle.findUnique.mockResolvedValue({ id: CYCLE_ID });
    prisma.academicCycleGroup.findFirst.mockResolvedValue({ id: GROUP_ID });
  });

  it("includes academicCycleSchoolSubjectId alongside the plain schoolSubjectId", async () => {
    prisma.academicCycleGroupCalendar.findMany.mockResolvedValue([CALENDAR_ROW]);

    const result = await service.findAllTeachers(CYCLE_ID, GROUP_ID);

    expect(result).toEqual([
      expect.objectContaining({
        schoolSubjectId: SUBJECT_ID,
        academicCycleSchoolSubjectId: CYCLE_SUBJECT_ID,
        teacherId: TEACHER_ID,
      }),
    ]);
  });

  it("dedupes by subject/teacher pair even across multiple calendar slots", async () => {
    prisma.academicCycleGroupCalendar.findMany.mockResolvedValue([
      CALENDAR_ROW,
      { ...CALENDAR_ROW, id: "calendar-2", day: "wednesday" },
    ]);

    const result = await service.findAllTeachers(CYCLE_ID, GROUP_ID);

    expect(result).toHaveLength(1);
  });
});
