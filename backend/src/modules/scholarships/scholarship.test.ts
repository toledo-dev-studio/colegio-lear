import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScholarshipService } from "./scholarship.service";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";

/**
 * Unit tests for ScholarshipService.
 * PrismaClient is fully mocked to isolate business logic.
 */

// --- Mock PrismaClient factory ---
function createMockPrisma() {
  return {
    scholarship: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

describe("ScholarshipService", () => {
  let prisma: MockPrisma;
  let service: ScholarshipService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new ScholarshipService(prisma as any);
  });

  // --- findAll ---
  describe("findAll", () => {
    it("should return all scholarships when no filters are provided", async () => {
      const mockScholarships = [
        {
          id: "uuid-1",
          name: "Beca Excelencia",
          description: "Beca por excelencia académica",
          discountPercentage: 50,
          isActive: true,
        },
      ];
      prisma.scholarship.findMany.mockResolvedValue(mockScholarships);

      const result = await service.findAll({});

      expect(result).toEqual([
        {
          id: "uuid-1",
          name: "Beca Excelencia",
          description: "Beca por excelencia académica",
          discountPercentage: 50,
          isActive: true,
        },
      ]);
      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });

    it("should apply q filter searching name and description", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);

      await service.findAll({ q: "deportiva" });

      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { name: { contains: "deportiva", mode: "insensitive" } },
                { description: { contains: "deportiva", mode: "insensitive" } },
              ],
            },
          ],
        },
      });
    });

    it("should apply name filter with case-insensitive contains", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);

      await service.findAll({ name: "Excelencia" });

      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ name: { contains: "Excelencia", mode: "insensitive" } }],
        },
      });
    });

    it("should apply isActive filter", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);

      await service.findAll({ isActive: true });

      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ isActive: true }],
        },
      });
    });

    it("should apply discountPercentage filter", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);

      await service.findAll({ discountPercentage: 50 });

      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ discountPercentage: 50 }],
        },
      });
    });

    it("should combine multiple filters with AND logic", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);

      await service.findAll({
        q: "beca",
        name: "Excelencia",
        isActive: true,
        discountPercentage: 50,
      });

      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { name: { contains: "beca", mode: "insensitive" } },
                { description: { contains: "beca", mode: "insensitive" } },
              ],
            },
            { name: { contains: "Excelencia", mode: "insensitive" } },
            { isActive: true },
            { discountPercentage: 50 },
          ],
        },
      });
    });
  });

  // --- findAllPaged ---
  describe("findAllPaged", () => {
    it("should return paginated results with correct metadata", async () => {
      const mockData = [
        {
          id: "uuid-1",
          name: "Beca Excelencia",
          description: "Desc",
          discountPercentage: 50,
          isActive: true,
        },
      ];
      prisma.scholarship.findMany.mockResolvedValue(mockData);
      prisma.scholarship.count.mockResolvedValue(15);

      const result = await service.findAllPaged({}, { page: 2, pageSize: 5 });

      expect(result).toEqual({
        data: [
          {
            id: "uuid-1",
            name: "Beca Excelencia",
            description: "Desc",
            discountPercentage: 50,
            isActive: true,
          },
        ],
        totalPages: 3,
        currentPage: 2,
        itemsCount: 15,
      });
      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        skip: 5,
        take: 5,
      });
      expect(prisma.scholarship.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });

    it("should apply filters together with pagination", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);
      prisma.scholarship.count.mockResolvedValue(0);

      const result = await service.findAllPaged(
        { isActive: false },
        { page: 1, pageSize: 10 },
      );

      expect(result).toEqual({
        data: [],
        totalPages: 0,
        currentPage: 1,
        itemsCount: 0,
      });
      expect(prisma.scholarship.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, AND: [{ isActive: false }] },
        skip: 0,
        take: 10,
      });
    });

    it("should calculate totalPages correctly (ceiling division)", async () => {
      prisma.scholarship.findMany.mockResolvedValue([]);
      prisma.scholarship.count.mockResolvedValue(11);

      const result = await service.findAllPaged({}, { page: 1, pageSize: 5 });

      expect(result.totalPages).toBe(3);
      expect(result.itemsCount).toBe(11);
    });
  });

  // --- findById ---
  describe("findById", () => {
    it("should return the scholarship when found", async () => {
      const mockScholarship = {
        id: "uuid-1",
        name: "Beca Excelencia",
        description: "Beca por excelencia académica",
        discountPercentage: 50,
        isActive: true,
      };
      prisma.scholarship.findUnique.mockResolvedValue(mockScholarship);

      const result = await service.findById("uuid-1");

      expect(result).toEqual({
        id: "uuid-1",
        name: "Beca Excelencia",
        description: "Beca por excelencia académica",
        discountPercentage: 50,
        isActive: true,
      });
      expect(prisma.scholarship.findUnique).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
      });
    });

    it("should throw NotFoundError when scholarship does not exist", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.findById("non-existent-id")).rejects.toThrow(
        "Scholarship not found",
      );
    });
  });

  // --- create ---
  describe("create", () => {
    const validDto = {
      name: "Beca Excelencia",
      description: "Beca por excelencia académica",
      discountPercentage: 50,
    };

    it("should create a scholarship successfully with valid data", async () => {
      prisma.scholarship.findFirst.mockResolvedValue(null);
      prisma.scholarship.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        isActive: true,
      });

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: "new-uuid",
        name: "Beca Excelencia",
        description: "Beca por excelencia académica",
        discountPercentage: 50,
        isActive: true,
      });
      expect(prisma.scholarship.create).toHaveBeenCalledWith({
        data: {
          name: validDto.name,
          description: validDto.description,
          discountPercentage: validDto.discountPercentage,
          isActive: true,
        },
      });
    });

    it("should throw ConflictError when name already exists (case-insensitive)", async () => {
      prisma.scholarship.findFirst.mockResolvedValue({
        id: "existing-uuid",
        name: "beca excelencia",
      });

      await expect(service.create(validDto)).rejects.toThrow(ConflictError);
      await expect(service.create(validDto)).rejects.toThrow(
        "A scholarship with this name already exists",
      );
    });

    it("should set isActive=true by default", async () => {
      prisma.scholarship.findFirst.mockResolvedValue(null);
      prisma.scholarship.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        isActive: true,
      });

      const result = await service.create(validDto);

      expect(result.isActive).toBe(true);
      expect(prisma.scholarship.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it("should check uniqueness with case-insensitive comparison", async () => {
      prisma.scholarship.findFirst.mockResolvedValue(null);
      prisma.scholarship.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        isActive: true,
      });

      await service.create(validDto);

      expect(prisma.scholarship.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: validDto.name, mode: "insensitive" },
        },
      });
    });
  });

  // --- update ---
  describe("update", () => {
    const existingScholarship = {
      id: "uuid-1",
      name: "Beca Excelencia",
      description: "Beca por excelencia académica",
      discountPercentage: 50,
      isActive: true,
    };

    it("should update a scholarship with valid partial data", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(existingScholarship);
      prisma.scholarship.findFirst.mockResolvedValue(null);
      prisma.scholarship.update.mockResolvedValue({
        ...existingScholarship,
        name: "Beca Deportiva",
      });

      const result = await service.update("uuid-1", { name: "Beca Deportiva" });

      expect(result.name).toBe("Beca Deportiva");
      expect(prisma.scholarship.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { name: "Beca Deportiva" },
      });
    });

    it("should throw NotFoundError when scholarship does not exist", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(null);

      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow("Scholarship not found");
    });

    it("should throw ConflictError when update causes name collision", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(existingScholarship);
      prisma.scholarship.findFirst.mockResolvedValue({
        id: "other-uuid",
        name: "Beca Deportiva",
      });

      await expect(
        service.update("uuid-1", { name: "Beca Deportiva" }),
      ).rejects.toThrow(ConflictError);
      await expect(
        service.update("uuid-1", { name: "Beca Deportiva" }),
      ).rejects.toThrow("A scholarship with this name already exists");
    });

    it("should not check uniqueness when name is not in dto", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(existingScholarship);
      prisma.scholarship.update.mockResolvedValue({
        ...existingScholarship,
        description: "Updated description",
      });

      await service.update("uuid-1", { description: "Updated description" });

      expect(prisma.scholarship.findFirst).not.toHaveBeenCalled();
    });

    it("should check uniqueness excluding self when name changes", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(existingScholarship);
      prisma.scholarship.findFirst.mockResolvedValue(null);
      prisma.scholarship.update.mockResolvedValue({
        ...existingScholarship,
        name: "Beca Deportiva",
      });

      await service.update("uuid-1", { name: "Beca Deportiva" });

      expect(prisma.scholarship.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: "Beca Deportiva", mode: "insensitive" },
          id: { not: "uuid-1" },
        },
      });
    });
  });

  // --- softDelete ---
  describe("softDelete", () => {
    it("should set isDeleted to true for an existing scholarship", async () => {
      prisma.scholarship.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Beca Excelencia",
        isDeleted: false,
      });
      prisma.scholarship.update.mockResolvedValue({
        id: "uuid-1",
        name: "Beca Excelencia",
        isDeleted: true,
      });

      await service.softDelete("uuid-1");

      expect(prisma.scholarship.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { isDeleted: true },
      });
    });

    it("should throw NotFoundError when scholarship does not exist", async () => {
      prisma.scholarship.findUnique.mockResolvedValue(null);

      await expect(service.softDelete("non-existent")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.softDelete("non-existent")).rejects.toThrow(
        "Scholarship not found",
      );
    });

    it("should throw ConflictError when scholarship is already deleted", async () => {
      prisma.scholarship.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Beca Excelencia",
        isDeleted: true,
      });

      await expect(service.softDelete("uuid-1")).rejects.toThrow(ConflictError);
      await expect(service.softDelete("uuid-1")).rejects.toThrow(
        "Scholarship is already deleted",
      );
    });
  });
});
