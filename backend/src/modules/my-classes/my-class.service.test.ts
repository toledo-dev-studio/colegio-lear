import { describe, it, expect, beforeEach, vi } from "vitest";
import { MyClassService } from "./my-class.service";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for MyClassService — covers the "assigned to this teacher"
 * filter (via calendars.some.teacherId) and the optional filters/pagination
 * layered on top. PrismaClient is fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycleGroup: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const TEACHER_ID = "11111111-1111-4111-8111-111111111111";
const GROUP_ID = "22222222-2222-4222-8222-222222222222";
const CYCLE_ID = "33333333-3333-4333-8333-333333333333";

const BASE_GROUP = {
  id: GROUP_ID,
  name: "Primero A (2026-2027)",
  status: "active",
  academicCycle: {
    id: CYCLE_ID,
    name: "2026 - 2027",
    code: "2026-A",
    periodType: "annual",
    status: "active",
    minimumPassingGrade: 6,
    evaluationCount: 3,
    startDate: new Date("2026-08-24T00:00:00.000Z"),
    endDate: new Date("2027-07-09T00:00:00.000Z"),
  },
};

describe("MyClassService", () => {
  let prisma: MockPrisma;
  let service: MyClassService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new MyClassService(prisma as any);
  });

  describe("findAllPaged", () => {
    it("scopes the query to classes assigned to the teacher", async () => {
      prisma.academicCycleGroup.findMany.mockResolvedValue([BASE_GROUP]);
      prisma.academicCycleGroup.count.mockResolvedValue(1);

      await service.findAllPaged(TEACHER_ID, {}, { page: 1, limit: 10 });

      expect(prisma.academicCycleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { calendars: { some: { teacherId: TEACHER_ID } } },
        }),
      );
    });

    it("applies name/status/academicCycleStatus filters as AND conditions", async () => {
      prisma.academicCycleGroup.findMany.mockResolvedValue([]);
      prisma.academicCycleGroup.count.mockResolvedValue(0);

      await service.findAllPaged(
        TEACHER_ID,
        { name: "Primero", status: "active", academicCycleStatus: "active" },
        { page: 1, limit: 10 },
      );

      expect(prisma.academicCycleGroup.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            calendars: { some: { teacherId: TEACHER_ID } },
            AND: [
              { name: { contains: "Primero", mode: "insensitive" } },
              { status: "active" },
              { academicCycle: { status: "active" } },
            ],
          }),
        }),
      );
    });

    it("maps the embedded academicCycle record", async () => {
      prisma.academicCycleGroup.findMany.mockResolvedValue([BASE_GROUP]);
      prisma.academicCycleGroup.count.mockResolvedValue(1);

      const result = await service.findAllPaged(TEACHER_ID, {}, { page: 1, limit: 10 });

      expect(result.data[0]!.academicCycle).toMatchObject({
        id: CYCLE_ID,
        name: "2026 - 2027",
        code: "2026-A",
        startDate: "2026-08-24T00:00:00.000Z",
      });
      expect(result.itemsCount).toBe(1);
    });
  });

  describe("findById", () => {
    it("throws NotFoundError when the group doesn't exist or isn't the teacher's own", async () => {
      prisma.academicCycleGroup.findFirst.mockResolvedValue(null);

      await expect(service.findById(TEACHER_ID, GROUP_ID)).rejects.toThrow(NotFoundError);
      expect(prisma.academicCycleGroup.findFirst).toHaveBeenCalledWith({
        where: { id: GROUP_ID, calendars: { some: { teacherId: TEACHER_ID } } },
        include: { academicCycle: true },
      });
    });

    it("returns the mapped class when the teacher is assigned to it", async () => {
      prisma.academicCycleGroup.findFirst.mockResolvedValue(BASE_GROUP);

      const result = await service.findById(TEACHER_ID, GROUP_ID);

      expect(result.id).toBe(GROUP_ID);
      expect(result.status).toBe("active");
    });
  });
});
