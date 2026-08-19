import { describe, it, expect, beforeEach, vi } from "vitest";
import { StudentAssistService } from "./student-assist.service";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";

/**
 * Unit tests for StudentAssistService — covers the enrollment-scope
 * validation, the date-range filter, the unique-per-day create guard, and
 * update/delete lifecycle. PrismaClient is fully mocked.
 */

function createMockPrisma() {
  return {
    academicCycleEnrollment: { findFirst: vi.fn() },
    studentAssist: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const CYCLE_ID = "cycle-uuid";
const ENROLLMENT_ID = "enrollment-uuid";
const ASSIST_ID = "assist-uuid";

const BASE_ASSIST = {
  id: ASSIST_ID,
  academicCycleEnrollmentId: ENROLLMENT_ID,
  assistDate: new Date("2026-09-10T00:00:00.000Z"),
  status: "present",
  absenceReason: null,
};

describe("StudentAssistService", () => {
  let prisma: MockPrisma;
  let service: StudentAssistService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new StudentAssistService(prisma as any);
    prisma.academicCycleEnrollment.findFirst.mockResolvedValue({ id: ENROLLMENT_ID });
  });

  describe("findAllPaged", () => {
    it("throws NotFoundError when the enrollment isn't in this cycle", async () => {
      prisma.academicCycleEnrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllPaged(CYCLE_ID, ENROLLMENT_ID, {}, { page: 1, pageSize: 10 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("orders by assistDate desc and paginates", async () => {
      prisma.studentAssist.findMany.mockResolvedValue([BASE_ASSIST]);
      prisma.studentAssist.count.mockResolvedValue(1);

      const result = await service.findAllPaged(
        CYCLE_ID,
        ENROLLMENT_ID,
        {},
        { page: 1, pageSize: 10 },
      );

      expect(prisma.studentAssist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { academicCycleEnrollmentId: ENROLLMENT_ID },
          orderBy: { assistDate: "desc" },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data[0]!.status).toBe("present");
      expect(result.itemsCount).toBe(1);
    });

    it("does not apply any date filter when fromDate/toDate are omitted", async () => {
      prisma.studentAssist.findMany.mockResolvedValue([]);
      prisma.studentAssist.count.mockResolvedValue(0);

      await service.findAllPaged(CYCLE_ID, ENROLLMENT_ID, {}, { page: 1, pageSize: 10 });

      expect(prisma.studentAssist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { academicCycleEnrollmentId: ENROLLMENT_ID },
        }),
      );
    });

    it("applies an inclusive date range when fromDate/toDate are given", async () => {
      prisma.studentAssist.findMany.mockResolvedValue([]);
      prisma.studentAssist.count.mockResolvedValue(0);

      await service.findAllPaged(
        CYCLE_ID,
        ENROLLMENT_ID,
        { fromDate: "2026-09-01", toDate: "2026-09-07T23:59:59.999Z" },
        { page: 1, pageSize: 10 },
      );

      expect(prisma.studentAssist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            academicCycleEnrollmentId: ENROLLMENT_ID,
            assistDate: {
              gte: new Date("2026-09-01"),
              lte: new Date("2026-09-07"),
            },
          },
        }),
      );
    });
  });

  describe("create", () => {
    it("throws ConflictError when a record already exists for that enrollment+day", async () => {
      prisma.studentAssist.findUnique.mockResolvedValue(BASE_ASSIST);

      await expect(
        service.create(CYCLE_ID, ENROLLMENT_ID, {
          assistDate: "2026-09-10",
          status: "present",
        }),
      ).rejects.toThrow(ConflictError);
      expect(prisma.studentAssist.create).not.toHaveBeenCalled();
    });

    it("creates the record scoped to enrollment+day", async () => {
      prisma.studentAssist.findUnique.mockResolvedValue(null);
      prisma.studentAssist.create.mockResolvedValue(BASE_ASSIST);

      await service.create(CYCLE_ID, ENROLLMENT_ID, {
        assistDate: "2026-09-10",
        status: "present",
      });

      expect(prisma.studentAssist.create).toHaveBeenCalledWith({
        data: {
          academicCycleEnrollmentId: ENROLLMENT_ID,
          assistDate: new Date("2026-09-10"),
          status: "present",
          absenceReason: null,
        },
      });
    });

    it("throws NotFoundError when the enrollment isn't in this cycle", async () => {
      prisma.academicCycleEnrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.create(CYCLE_ID, ENROLLMENT_ID, {
          assistDate: "2026-09-10",
          status: "absent",
          absenceReason: "Cita médica",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("update", () => {
    it("throws NotFoundError when the record isn't on this enrollment", async () => {
      prisma.studentAssist.findFirst.mockResolvedValue(null);

      await expect(
        service.update(CYCLE_ID, ENROLLMENT_ID, ASSIST_ID, { status: "absent" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("updates only the provided fields", async () => {
      prisma.studentAssist.findFirst.mockResolvedValue(BASE_ASSIST);
      prisma.studentAssist.update.mockResolvedValue({
        ...BASE_ASSIST,
        status: "absent",
        absenceReason: "Cita médica",
      });

      await service.update(CYCLE_ID, ENROLLMENT_ID, ASSIST_ID, {
        status: "absent",
        absenceReason: "Cita médica",
      });

      expect(prisma.studentAssist.update).toHaveBeenCalledWith({
        where: { id: ASSIST_ID },
        data: { status: "absent", absenceReason: "Cita médica" },
      });
    });
  });

  describe("remove", () => {
    it("throws NotFoundError when the record isn't on this enrollment", async () => {
      prisma.studentAssist.findFirst.mockResolvedValue(null);

      await expect(service.remove(CYCLE_ID, ENROLLMENT_ID, ASSIST_ID)).rejects.toThrow(
        NotFoundError,
      );
      expect(prisma.studentAssist.delete).not.toHaveBeenCalled();
    });

    it("deletes the record", async () => {
      prisma.studentAssist.findFirst.mockResolvedValue(BASE_ASSIST);

      await service.remove(CYCLE_ID, ENROLLMENT_ID, ASSIST_ID);

      expect(prisma.studentAssist.delete).toHaveBeenCalledWith({
        where: { id: ASSIST_ID },
      });
    });
  });
});
