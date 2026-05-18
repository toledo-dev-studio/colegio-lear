import { describe, it, expect, beforeEach, vi } from "vitest";
import { AcademicLevelService } from "./academic-level.service";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";

/**
 * Unit tests for AcademicLevelService.
 * PrismaClient is fully mocked to isolate business logic.
 */

// --- Mock PrismaClient factory ---
function createMockPrisma() {
  return {
    academicLevel: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    educationLevel: {
      findMany: vi.fn(),
      count: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

describe("AcademicLevelService", () => {
  let prisma: MockPrisma;
  let service: AcademicLevelService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = createMockPrisma();
    service = new AcademicLevelService(prisma as any);
  });

  // --- findAll ---
  describe("findAll", () => {
    it("should return all academic levels when no filters are provided", async () => {
      const mockLevels = [
        {
          id: "uuid-1",
          name: "Preescolar",
          description: "Nivel preescolar",
          status: true,
          educationLevels: [],
        },
        {
          id: "uuid-2",
          name: "Primaria",
          description: "Nivel primaria",
          status: true,
          educationLevels: [],
        },
      ];
      prisma.academicLevel.findMany.mockResolvedValue(mockLevels);

      const result = await service.findAll({});

      expect(result).toEqual([
        {
          id: "uuid-1",
          name: "Preescolar",
          description: "Nivel preescolar",
          status: true,
          educationLevels: [],
        },
        {
          id: "uuid-2",
          name: "Primaria",
          description: "Nivel primaria",
          status: true,
          educationLevels: [],
        },
      ]);
      expect(prisma.academicLevel.findMany).toHaveBeenCalledWith({
        where: {},
        include: { educationLevels: true },
      });
    });

    it("should apply q filter searching name and description", async () => {
      prisma.academicLevel.findMany.mockResolvedValue([]);

      await service.findAll({ q: "primaria" });

      expect(prisma.academicLevel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: "primaria", mode: "insensitive" } },
                { description: { contains: "primaria", mode: "insensitive" } },
              ],
            },
          ],
        },
        include: { educationLevels: true },
      });
    });

    it("should apply status filter", async () => {
      prisma.academicLevel.findMany.mockResolvedValue([]);

      await service.findAll({ status: true });

      expect(prisma.academicLevel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ status: true }],
        },
        include: { educationLevels: true },
      });
    });

    it("should combine multiple filters with AND logic", async () => {
      prisma.academicLevel.findMany.mockResolvedValue([]);

      await service.findAll({ q: "nivel", name: "Primaria", status: true });

      expect(prisma.academicLevel.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: "nivel", mode: "insensitive" } },
                { description: { contains: "nivel", mode: "insensitive" } },
              ],
            },
            { name: { contains: "Primaria", mode: "insensitive" } },
            { status: true },
          ],
        },
        include: { educationLevels: true },
      });
    });
  });

  // --- findAllPaged ---
  describe("findAllPaged", () => {
    it("should return paginated results with correct metadata", async () => {
      const mockData = [
        {
          id: "uuid-1",
          name: "Preescolar",
          description: "Nivel preescolar",
          status: true,
          educationLevels: [],
        },
      ];
      prisma.academicLevel.findMany.mockResolvedValue(mockData);
      prisma.academicLevel.count.mockResolvedValue(15);

      const result = await service.findAllPaged({}, { page: 2, limit: 5 });

      expect(result).toEqual({
        data: [
          {
            id: "uuid-1",
            name: "Preescolar",
            description: "Nivel preescolar",
            status: true,
            educationLevels: [],
          },
        ],
        totalPages: 3,
        currentPage: 2,
        itemsCount: 15,
      });
      expect(prisma.academicLevel.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        include: { educationLevels: true },
      });
      expect(prisma.academicLevel.count).toHaveBeenCalledWith({ where: {} });
    });
  });

  // --- findById ---
  describe("findById", () => {
    it("should return academic level with education levels when found", async () => {
      const mockAcademicLevel = {
        id: "uuid-1",
        name: "Primaria",
        description: "Nivel primaria",
        status: true,
        educationLevels: [
          {
            id: "el-1",
            name: "1° Primaria",
            description: "Primer grado",
            academicLevelId: "uuid-1",
          },
          {
            id: "el-2",
            name: "2° Primaria",
            description: null,
            academicLevelId: "uuid-1",
          },
        ],
      };
      prisma.academicLevel.findUnique.mockResolvedValue(mockAcademicLevel);

      const result = await service.findById("uuid-1");

      expect(result).toEqual({
        id: "uuid-1",
        name: "Primaria",
        description: "Nivel primaria",
        status: true,
        educationLevels: [
          {
            id: "el-1",
            name: "1° Primaria",
            description: "Primer grado",
            academicLevelId: "uuid-1",
          },
          {
            id: "el-2",
            name: "2° Primaria",
            description: null,
            academicLevelId: "uuid-1",
          },
        ],
      });
      expect(prisma.academicLevel.findUnique).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        include: { educationLevels: true },
      });
    });

    it("should throw NotFoundError when academic level does not exist", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.findById("non-existent-id")).rejects.toThrow(
        "Academic level not found",
      );
    });
  });

  // --- create ---
  describe("create", () => {
    const validDto = {
      name: "Preparatoria",
      description: "Nivel preparatoria",
    };

    it("should create an academic level successfully with status=true", async () => {
      prisma.academicLevel.findFirst.mockResolvedValue(null);
      prisma.academicLevel.create.mockResolvedValue({
        id: "new-uuid",
        name: validDto.name,
        description: validDto.description,
        status: true,
        educationLevels: [],
      });

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: "new-uuid",
        name: "Preparatoria",
        description: "Nivel preparatoria",
        status: true,
        educationLevels: [],
      });
      expect(prisma.academicLevel.create).toHaveBeenCalledWith({
        data: {
          name: validDto.name,
          description: validDto.description,
          status: true,
        },
        include: { educationLevels: true },
      });
    });

    it("should throw ConflictError on duplicate name (case-insensitive)", async () => {
      prisma.academicLevel.findFirst.mockResolvedValue({
        id: "existing-uuid",
        name: "preparatoria",
        description: "Existing",
        status: true,
      });

      await expect(service.create(validDto)).rejects.toThrow(ConflictError);
      await expect(service.create(validDto)).rejects.toThrow(
        "An academic level with this name already exists",
      );
    });
  });

  // --- update ---
  describe("update", () => {
    const existingLevel = {
      id: "uuid-1",
      name: "Primaria",
      description: "Nivel primaria",
      status: true,
    };

    it("should update an academic level successfully", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        ...existingLevel,
        educationLevels: [],
      });
      prisma.academicLevel.findFirst.mockResolvedValue(null);
      prisma.academicLevel.update.mockResolvedValue({
        ...existingLevel,
        name: "Primaria Actualizada",
        educationLevels: [],
      });

      const result = await service.update("uuid-1", {
        name: "Primaria Actualizada",
      });

      expect(result.name).toBe("Primaria Actualizada");
    });

    it("should throw NotFoundError when academic level does not exist", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue(null);

      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow("Academic level not found");
    });

    it("should throw ConflictError on duplicate name", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        ...existingLevel,
        educationLevels: [],
      });
      prisma.academicLevel.findFirst.mockResolvedValue({
        id: "other-uuid",
        name: "Secundaria",
        description: "Nivel secundaria",
        status: true,
      });

      await expect(
        service.update("uuid-1", { name: "Secundaria" }),
      ).rejects.toThrow(ConflictError);
      await expect(
        service.update("uuid-1", { name: "Secundaria" }),
      ).rejects.toThrow("An academic level with this name already exists");
    });
  });

  // --- softDelete ---
  describe("softDelete", () => {
    it("should set status to false for an active academic level", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Primaria",
        status: true,
      });
      prisma.academicLevel.update.mockResolvedValue({
        id: "uuid-1",
        name: "Primaria",
        status: false,
      });

      await service.softDelete("uuid-1");

      expect(prisma.academicLevel.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { status: false },
      });
    });

    it("should throw NotFoundError when academic level does not exist", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue(null);

      await expect(service.softDelete("non-existent")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.softDelete("non-existent")).rejects.toThrow(
        "Academic level not found",
      );
    });

    it("should throw ConflictError when academic level is already inactive", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Primaria",
        status: false,
      });

      await expect(service.softDelete("uuid-1")).rejects.toThrow(ConflictError);
      await expect(service.softDelete("uuid-1")).rejects.toThrow(
        "Academic level is already inactive",
      );
    });
  });

  // --- findEducationLevelsPaged ---
  describe("findEducationLevelsPaged", () => {
    it("should return paginated education levels with correct metadata", async () => {
      const mockData = [
        {
          id: "el-1",
          name: "1° Primaria",
          description: "Primer grado",
          academicLevelId: "uuid-1",
        },
        {
          id: "el-2",
          name: "2° Primaria",
          description: null,
          academicLevelId: "uuid-1",
        },
      ];
      prisma.educationLevel.findMany.mockResolvedValue(mockData);
      prisma.educationLevel.count.mockResolvedValue(12);

      const result = await service.findEducationLevelsPaged(
        { academicLevelId: "uuid-1" },
        { page: 1, limit: 10 },
      );

      expect(result).toEqual({
        data: [
          {
            id: "el-1",
            name: "1° Primaria",
            description: "Primer grado",
            academicLevelId: "uuid-1",
          },
          {
            id: "el-2",
            name: "2° Primaria",
            description: null,
            academicLevelId: "uuid-1",
          },
        ],
        totalPages: 2,
        currentPage: 1,
        itemsCount: 12,
      });
      expect(prisma.educationLevel.findMany).toHaveBeenCalledWith({
        where: { AND: [{ academicLevelId: "uuid-1" }] },
        skip: 0,
        take: 10,
      });
      expect(prisma.educationLevel.count).toHaveBeenCalledWith({
        where: { AND: [{ academicLevelId: "uuid-1" }] },
      });
    });
  });
});
