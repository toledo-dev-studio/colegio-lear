import { describe, it, expect, beforeEach, vi } from "vitest";
import { AcademicCycleEnrollmentService } from "./academic-cycle-enrollment.service";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for AcademicCycleEnrollmentService.findAllByGroup — the
 * non-paged, group-scoped listing added for "my classes" (chats/grades
 * roster). The rest of the service (paged CRUD) is pre-existing and
 * untouched. PrismaClient is fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycle: { findUnique: vi.fn() },
    academicCycleEnrollment: { findMany: vi.fn() },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const CYCLE_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";

describe("AcademicCycleEnrollmentService.findAllByGroup", () => {
  let prisma: MockPrisma;
  let service: AcademicCycleEnrollmentService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new AcademicCycleEnrollmentService(prisma as any);
  });

  it("throws NotFoundError when the academic cycle doesn't exist", async () => {
    prisma.academicCycle.findUnique.mockResolvedValue(null);

    await expect(
      service.findAllByGroup(CYCLE_ID, { academicCycleSchoolGroupId: GROUP_ID }),
    ).rejects.toThrow(NotFoundError);
    expect(prisma.academicCycleEnrollment.findMany).not.toHaveBeenCalled();
  });

  it("returns every match with no pagination, scoped to the group", async () => {
    prisma.academicCycle.findUnique.mockResolvedValue({ id: CYCLE_ID });
    prisma.academicCycleEnrollment.findMany.mockResolvedValue([
      {
        id: "enr-1",
        code: "ENR-2026-0001",
        status: "enrolled",
        observations: null,
        droppedNotes: null,
        studentId: "student-1",
        student: { id: "student-1", name: "Ana", firstLastName: "Pérez" },
        academicCycleId: CYCLE_ID,
        academicCycle: { id: CYCLE_ID, name: "2026", status: "active" },
        academicCycleSchoolGroupId: GROUP_ID,
        academicCycleSchoolGroup: { id: GROUP_ID, name: "1A" },
        scholarshipId: null,
        scholarship: null,
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
      },
    ]);

    const result = await service.findAllByGroup(CYCLE_ID, {
      academicCycleSchoolGroupId: GROUP_ID,
      status: "enrolled",
    });

    expect(prisma.academicCycleEnrollment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          academicCycleId: CYCLE_ID,
          AND: [{ status: "enrolled" }, { academicCycleSchoolGroupId: GROUP_ID }],
        }),
      }),
    );
    expect(prisma.academicCycleEnrollment.findMany.mock.calls[0]![0]).not.toHaveProperty("skip");
    expect(prisma.academicCycleEnrollment.findMany.mock.calls[0]![0]).not.toHaveProperty("take");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("enr-1");
  });
});
