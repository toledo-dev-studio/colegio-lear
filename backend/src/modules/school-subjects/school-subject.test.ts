import { describe, it, expect, beforeEach, vi } from "vitest";
import { SchoolSubjectService } from "./school-subject.service";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";

/**
 * Unit tests for SchoolSubjectService.
 * PrismaClient is fully mocked to isolate business logic.
 */

// --- Mock PrismaClient factory ---
function createMockPrisma() {
  return {
    schoolSubject: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    academicLevel: {
      findUnique: vi.fn(),
    },
    educationLevel: {
      findUnique: vi.fn(),
    },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

describe("SchoolSubjectService", () => {
  let prisma: MockPrisma;
  let service: SchoolSubjectService;

  beforeEach(() => {
    prisma = createMockPrisma();
    // Cast to any since we're providing a partial mock
    service = new SchoolSubjectService(prisma as any);
  });

  // --- findAll ---
  describe("findAll", () => {
    it("should return all subjects when no filters are provided", async () => {
      const mockSubjects = [
        {
          id: "uuid-1",
          name: "Matemáticas",
          description: "Curso de matemáticas",
          isActive: true,
          academicLevelId: "al-1",
          academicLevelName: "Primaria",
          educationLevelId: "el-1",
          educationLevelName: "1° Primaria",
        },
      ];
      prisma.schoolSubject.findMany.mockResolvedValue(mockSubjects);

      const result = await service.findAll({});

      expect(result).toEqual(mockSubjects);
      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
      });
    });

    it("should apply q filter searching name and description", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);

      await service.findAll({ q: "math" });

      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { name: { contains: "math", mode: "insensitive" } },
                { description: { contains: "math", mode: "insensitive" } },
              ],
            },
          ],
        },
      });
    });

    it("should apply name filter with case-insensitive contains", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);

      await service.findAll({ name: "Ciencias" });

      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: {
          isDeleted: false,
          AND: [{ name: { contains: "Ciencias", mode: "insensitive" } }],
        },
      });
    });

    it("should apply isActive filter", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);

      await service.findAll({ isActive: true });

      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: {
          isDeleted: false,
          AND: [{ isActive: true }],
        },
      });
    });

    it("should apply academicLevelId filter", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);

      await service.findAll({ academicLevelId: "al-uuid" });

      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: {
          isDeleted: false,
          AND: [{ academicLevelId: "al-uuid" }],
        },
      });
    });

    it("should apply educationLevelId filter", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);

      await service.findAll({ educationLevelId: "el-uuid" });

      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: {
          isDeleted: false,
          AND: [{ educationLevelId: "el-uuid" }],
        },
      });
    });

    it("should combine multiple filters with AND logic", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);

      await service.findAll({
        q: "math",
        isActive: true,
        academicLevelId: "al-uuid",
      });

      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { name: { contains: "math", mode: "insensitive" } },
                { description: { contains: "math", mode: "insensitive" } },
              ],
            },
            { isActive: true },
            { academicLevelId: "al-uuid" },
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
          name: "Matemáticas",
          description: "Desc",
          isActive: true,
          academicLevelId: "al-1",
          academicLevelName: "Primaria",
          educationLevelId: "el-1",
          educationLevelName: "1° Primaria",
        },
      ];
      prisma.schoolSubject.findMany.mockResolvedValue(mockData);
      prisma.schoolSubject.count.mockResolvedValue(15);

      const result = await service.findAllPaged({}, { page: 2, limit: 5 });

      expect(result).toEqual({
        data: mockData,
        totalPages: 3,
        currentPage: 2,
        itemsCount: 15,
      });
      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: { isDeleted: false },
        skip: 5,
        take: 5,
      });
      expect(prisma.schoolSubject.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });

    it("should apply filters together with pagination", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);
      prisma.schoolSubject.count.mockResolvedValue(0);

      const result = await service.findAllPaged(
        { isActive: false },
        { page: 1, limit: 10 },
      );

      expect(result).toEqual({
        data: [],
        totalPages: 0,
        currentPage: 1,
        itemsCount: 0,
      });
      expect(prisma.schoolSubject.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
        where: { isDeleted: false, AND: [{ isActive: false }] },
        skip: 0,
        take: 10,
      });
    });

    it("should calculate totalPages correctly (ceiling division)", async () => {
      prisma.schoolSubject.findMany.mockResolvedValue([]);
      prisma.schoolSubject.count.mockResolvedValue(11);

      const result = await service.findAllPaged({}, { page: 1, limit: 5 });

      expect(result.totalPages).toBe(3);
      expect(result.itemsCount).toBe(11);
    });
  });

  // --- findById ---
  describe("findById", () => {
    it("should return the subject when found", async () => {
      const mockSubject = {
        id: "uuid-1",
        name: "Matemáticas",
        description: "Curso de matemáticas",
        isActive: true,
        isDeleted: false,
        academicLevelId: "al-1",
        academicLevelName: "Primaria",
        educationLevelId: "el-1",
        educationLevelName: "1° Primaria",
      };
      prisma.schoolSubject.findUnique.mockResolvedValue(mockSubject);

      const result = await service.findById("uuid-1");

      const { isDeleted: _isDeleted, ...expected } = mockSubject;
      expect(result).toEqual(expected);
      expect(prisma.schoolSubject.findUnique).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          isDeleted: true,
          academicLevelId: true,
          educationLevelId: true,
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
      });
    });

    it("should throw NotFoundError when subject does not exist", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.findById("non-existent-id")).rejects.toThrow(
        "Materia no encontrada",
      );
    });
  });

  // --- create ---
  describe("create", () => {
    const validDto = {
      name: "Matemáticas",
      description: "Curso de matemáticas básicas",
      academicLevelId: "al-uuid-1",
      educationLevelId: "el-uuid-1",
    };

    it("should create a subject successfully with valid data", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        id: "al-uuid-1",
        name: "Primaria",
      });
      prisma.educationLevel.findUnique.mockResolvedValue({
        id: "el-uuid-1",
        name: "1° Primaria",
      });
      prisma.schoolSubject.findFirst.mockResolvedValue(null);
      prisma.schoolSubject.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        isActive: true,
      });

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: "new-uuid",
        ...validDto,
        isActive: true,
      });
      expect(prisma.schoolSubject.create).toHaveBeenCalledWith({
        data: {
          name: validDto.name,
          description: validDto.description,
          isActive: true,
          academicLevelId: validDto.academicLevelId,
          educationLevelId: validDto.educationLevelId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
        },
      });
    });

    it("should throw NotFoundError when academicLevelId does not exist", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(NotFoundError);
      await expect(service.create(validDto)).rejects.toThrow(
        "Nivel académico no encontrado",
      );
    });

    it("should throw NotFoundError when educationLevelId does not exist", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        id: "al-uuid-1",
        name: "Primaria",
      });
      prisma.educationLevel.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(NotFoundError);
      await expect(service.create(validDto)).rejects.toThrow(
        "Nivel educativo no encontrado",
      );
    });

    it("should throw ConflictError when name+educationLevelId already exists", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue({
        id: "al-uuid-1",
        name: "Primaria",
      });
      prisma.educationLevel.findUnique.mockResolvedValue({
        id: "el-uuid-1",
        name: "1° Primaria",
      });
      prisma.schoolSubject.findFirst.mockResolvedValue({
        id: "existing-uuid",
        name: "Matemáticas",
        educationLevelId: "el-uuid-1",
      });

      await expect(service.create(validDto)).rejects.toThrow(ConflictError);
      await expect(service.create(validDto)).rejects.toThrow(
        "Ya existe una materia con este nombre para el nivel educativo seleccionado",
      );
    });

    it("should validate academicLevelId before educationLevelId", async () => {
      prisma.academicLevel.findUnique.mockResolvedValue(null);

      await expect(service.create(validDto)).rejects.toThrow(
        "Nivel académico no encontrado",
      );
      // educationLevel.findUnique should not be called
      expect(prisma.educationLevel.findUnique).not.toHaveBeenCalled();
    });
  });

  // --- update ---
  describe("update", () => {
    const existingSubject = {
      id: "uuid-1",
      name: "Matemáticas",
      description: "Curso de matemáticas",
      isActive: true,
      academicLevelId: "al-uuid-1",
      educationLevelId: "el-uuid-1",
    };

    it("should update a subject with valid partial data", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(existingSubject);
      prisma.schoolSubject.findFirst.mockResolvedValue(null);
      prisma.schoolSubject.update.mockResolvedValue({
        ...existingSubject,
        name: "Álgebra",
      });

      const result = await service.update("uuid-1", { name: "Álgebra" });

      expect(result.name).toBe("Álgebra");
      expect(prisma.schoolSubject.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { name: "Álgebra" },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          academicLevelId: true,
          educationLevelId: true,
        },
      });
    });

    it("should throw NotFoundError when subject does not exist", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(null);

      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow("Materia no encontrada");
    });

    it("should throw NotFoundError when updated academicLevelId does not exist", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(existingSubject);
      prisma.academicLevel.findUnique.mockResolvedValue(null);

      await expect(
        service.update("uuid-1", { academicLevelId: "invalid-al" }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("uuid-1", { academicLevelId: "invalid-al" }),
      ).rejects.toThrow("Nivel académico no encontrado");
    });

    it("should throw NotFoundError when updated educationLevelId does not exist", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(existingSubject);
      prisma.educationLevel.findUnique.mockResolvedValue(null);

      await expect(
        service.update("uuid-1", { educationLevelId: "invalid-el" }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("uuid-1", { educationLevelId: "invalid-el" }),
      ).rejects.toThrow("Nivel educativo no encontrado");
    });

    it("should throw ConflictError when update causes uniqueness conflict", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(existingSubject);
      prisma.schoolSubject.findFirst.mockResolvedValue({
        id: "other-uuid",
        name: "Ciencias",
        educationLevelId: "el-uuid-1",
      });

      await expect(
        service.update("uuid-1", { name: "Ciencias" }),
      ).rejects.toThrow(ConflictError);
      await expect(
        service.update("uuid-1", { name: "Ciencias" }),
      ).rejects.toThrow(
        "Ya existe una materia con este nombre para el nivel educativo seleccionado",
      );
    });

    it("should not check uniqueness when name and educationLevelId are not in dto", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(existingSubject);
      prisma.schoolSubject.update.mockResolvedValue({
        ...existingSubject,
        description: "Updated description",
      });

      await service.update("uuid-1", { description: "Updated description" });

      expect(prisma.schoolSubject.findFirst).not.toHaveBeenCalled();
    });
  });

  // --- softDelete ---
  describe("softDelete", () => {
    it("should set isDeleted to true for an existing subject", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Matemáticas",
        isDeleted: false,
      });
      prisma.schoolSubject.update.mockResolvedValue({
        id: "uuid-1",
        name: "Matemáticas",
        isDeleted: true,
      });

      await service.softDelete("uuid-1");

      expect(prisma.schoolSubject.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { isDeleted: true },
      });
    });

    it("should throw ConflictError when subject is already deleted", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Matemáticas",
        isDeleted: true,
      });

      await expect(service.softDelete("uuid-1")).rejects.toThrow(ConflictError);
      await expect(service.softDelete("uuid-1")).rejects.toThrow(
        "La materia ya fue eliminada",
      );
    });

    it("should throw NotFoundError when subject does not exist", async () => {
      prisma.schoolSubject.findUnique.mockResolvedValue(null);

      await expect(service.softDelete("non-existent")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.softDelete("non-existent")).rejects.toThrow(
        "Materia no encontrada",
      );
    });
  });
});
