import { describe, it, expect, beforeEach, vi } from "vitest";
import { PaymentConceptService } from "./payment-concept.service";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";

/**
 * Unit tests for PaymentConceptService.
 * PrismaClient is fully mocked to isolate business logic.
 */

// --- Mock PrismaClient factory ---
function createMockPrisma() {
  return {
    paymentConcept: {
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

describe("PaymentConceptService", () => {
  let prisma: MockPrisma;
  let service: PaymentConceptService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new PaymentConceptService(prisma as any);
  });

  // --- findAll ---
  describe("findAll", () => {
    it("should return all payment concepts when no filters are provided", async () => {
      const mockData = [
        {
          id: "uuid-1",
          name: "Inscripción",
          code: "INSCRIP",
          description: "Cuota de inscripción",
          amount: 3500.0,
          allowForgiveness: true,
          isActive: true,
        },
      ];
      prisma.paymentConcept.findMany.mockResolvedValue(mockData);

      const result = await service.findAll({});

      expect(result).toEqual([
        {
          id: "uuid-1",
          name: "Inscripción",
          code: "INSCRIP",
          description: "Cuota de inscripción",
          amount: 3500.0,
          allowForgiveness: true,
          isActive: true,
        },
      ]);
      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });

    it("should apply q filter searching name and description", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ q: "inscripción" });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { name: { contains: "inscripción", mode: "insensitive" } },
                {
                  description: {
                    contains: "inscripción",
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        },
      });
    });

    it("should apply name filter with case-insensitive contains", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ name: "Colegiatura" });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ name: { contains: "Colegiatura", mode: "insensitive" } }],
        },
      });
    });

    it("should apply isActive filter", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ isActive: true });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ isActive: true }],
        },
      });
    });

    it("should apply allowForgiveness filter", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ allowForgiveness: false });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ allowForgiveness: false }],
        },
      });
    });

    it("should apply amount filter (exact match)", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ amount: 3500.0 });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [{ amount: 3500.0 }],
        },
      });
    });

    it("should combine multiple filters with AND logic", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({
        q: "pago",
        name: "Inscripción",
        isActive: true,
        allowForgiveness: true,
        amount: 1500.0,
      });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          AND: [
            {
              OR: [
                { name: { contains: "pago", mode: "insensitive" } },
                { description: { contains: "pago", mode: "insensitive" } },
              ],
            },
            { name: { contains: "Inscripción", mode: "insensitive" } },
            { isActive: true },
            { allowForgiveness: true },
            { amount: 1500.0 },
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
          name: "Inscripción",
          code: "INSCRIP",
          description: "Cuota de inscripción",
          amount: 3500.0,
          allowForgiveness: true,
          isActive: true,
        },
      ];
      prisma.paymentConcept.findMany.mockResolvedValue(mockData);
      prisma.paymentConcept.count.mockResolvedValue(15);

      const result = await service.findAllPaged({}, { page: 2, pageSize: 5 });

      expect(result).toEqual({
        data: [
          {
            id: "uuid-1",
            name: "Inscripción",
            code: "INSCRIP",
            description: "Cuota de inscripción",
            amount: 3500.0,
            allowForgiveness: true,
            isActive: true,
          },
        ],
        totalPages: 3,
        currentPage: 2,
        itemsCount: 15,
      });
      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        skip: 5,
        take: 5,
      });
      expect(prisma.paymentConcept.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
    });

    it("should apply filters together with pagination", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);
      prisma.paymentConcept.count.mockResolvedValue(0);

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
      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, AND: [{ isActive: false }] },
        skip: 0,
        take: 10,
      });
    });

    it("should calculate totalPages correctly (ceiling division)", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);
      prisma.paymentConcept.count.mockResolvedValue(11);

      const result = await service.findAllPaged({}, { page: 1, pageSize: 5 });

      expect(result.totalPages).toBe(3);
      expect(result.itemsCount).toBe(11);
    });
  });

  // --- findById ---
  describe("findById", () => {
    it("should return the payment concept when found", async () => {
      const mockPaymentConcept = {
        id: "uuid-1",
        name: "Inscripción",
        code: "INSCRIP",
        description: "Cuota de inscripción al ciclo escolar",
        amount: 3500.0,
        allowForgiveness: true,
        isActive: true,
      };
      prisma.paymentConcept.findUnique.mockResolvedValue(mockPaymentConcept);

      const result = await service.findById("uuid-1");

      expect(result).toEqual({
        id: "uuid-1",
        name: "Inscripción",
        code: "INSCRIP",
        description: "Cuota de inscripción al ciclo escolar",
        amount: 3500.0,
        allowForgiveness: true,
        isActive: true,
      });
      expect(prisma.paymentConcept.findUnique).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
      });
    });

    it("should throw NotFoundError when payment concept does not exist", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.findById("non-existent-id")).rejects.toThrow(
        "Payment concept not found",
      );
    });
  });

  // --- create ---
  describe("create", () => {
    const validDto = {
      name: "Inscripción",
      code: "INSCRIP",
      description: "Cuota de inscripción al ciclo escolar",
      amount: 3500.0,
    };

    it("should create a payment concept successfully with valid data", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        isActive: true,
      });

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: "new-uuid",
        name: "Inscripción",
        code: "INSCRIP",
        description: "Cuota de inscripción al ciclo escolar",
        amount: 3500.0,
        allowForgiveness: false,
        isActive: true,
      });
      expect(prisma.paymentConcept.create).toHaveBeenCalledWith({
        data: {
          name: validDto.name,
          code: validDto.code,
          description: validDto.description,
          amount: validDto.amount,
          allowForgiveness: false,
          isActive: true,
        },
      });
    });

    it("should throw ConflictError when name already exists (case-insensitive)", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue({
        id: "existing-uuid",
        name: "inscripción",
      });

      await expect(service.create(validDto)).rejects.toThrow(ConflictError);
      await expect(service.create(validDto)).rejects.toThrow(
        "A payment concept with this name already exists",
      );
    });

    it("should throw ConflictError when code already exists (case-insensitive)", async () => {
      // name check (first call) passes, code check (second call) finds a match
      prisma.paymentConcept.findFirst.mockImplementation(
        ({ where }: { where: Record<string, unknown> }) =>
          Promise.resolve(
            "code" in where ? { id: "existing-uuid", code: "inscrip" } : null,
          ),
      );

      await expect(service.create(validDto)).rejects.toThrow(ConflictError);
      await expect(service.create(validDto)).rejects.toThrow(
        "A payment concept with this code already exists",
      );
    });

    it("should set isActive=true by default", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        isActive: true,
      });

      const result = await service.create(validDto);

      expect(result.isActive).toBe(true);
      expect(prisma.paymentConcept.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it("should set allowForgiveness to false by default when not provided", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        isActive: true,
      });

      const result = await service.create(validDto);

      expect(result.allowForgiveness).toBe(false);
      expect(prisma.paymentConcept.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ allowForgiveness: false }),
        }),
      );
    });

    it("should respect allowForgiveness when explicitly provided as true", async () => {
      const dtoWithRemission = { ...validDto, allowForgiveness: true };
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...dtoWithRemission,
        isActive: true,
      });

      const result = await service.create(dtoWithRemission);

      expect(result.allowForgiveness).toBe(true);
      expect(prisma.paymentConcept.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ allowForgiveness: true }),
        }),
      );
    });

    it("should check uniqueness with case-insensitive comparison", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        isActive: true,
      });

      await service.create(validDto);

      expect(prisma.paymentConcept.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: validDto.name, mode: "insensitive" },
        },
      });
    });
  });

  // --- update ---
  describe("update", () => {
    const existingPaymentConcept = {
      id: "uuid-1",
      name: "Inscripción",
      code: "INSCRIP",
      description: "Cuota de inscripción al ciclo escolar",
      amount: 3500.0,
      allowForgiveness: true,
      isActive: true,
    };

    it("should update a payment concept with valid partial data", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.update.mockResolvedValue({
        ...existingPaymentConcept,
        name: "Colegiatura mensual",
      });

      const result = await service.update("uuid-1", {
        name: "Colegiatura mensual",
      });

      expect(result.name).toBe("Colegiatura mensual");
      expect(prisma.paymentConcept.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { name: "Colegiatura mensual" },
      });
    });

    it("should throw NotFoundError when payment concept does not exist", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(null);

      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow(NotFoundError);
      await expect(
        service.update("non-existent", { name: "New Name" }),
      ).rejects.toThrow("Payment concept not found");
    });

    it("should throw ConflictError when update causes name collision", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.findFirst.mockResolvedValue({
        id: "other-uuid",
        name: "Colegiatura mensual",
      });

      await expect(
        service.update("uuid-1", { name: "Colegiatura mensual" }),
      ).rejects.toThrow(ConflictError);
      await expect(
        service.update("uuid-1", { name: "Colegiatura mensual" }),
      ).rejects.toThrow("A payment concept with this name already exists");
    });

    it("should not check uniqueness when name is not in dto", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.update.mockResolvedValue({
        ...existingPaymentConcept,
        description: "Updated description",
      });

      await service.update("uuid-1", { description: "Updated description" });

      expect(prisma.paymentConcept.findFirst).not.toHaveBeenCalled();
    });

    it("should check uniqueness excluding self when name changes", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.update.mockResolvedValue({
        ...existingPaymentConcept,
        name: "Colegiatura mensual",
      });

      await service.update("uuid-1", { name: "Colegiatura mensual" });

      expect(prisma.paymentConcept.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: "Colegiatura mensual", mode: "insensitive" },
          id: { not: "uuid-1" },
        },
      });
    });

    it("should not check code uniqueness when code is not in dto", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.update.mockResolvedValue({
        ...existingPaymentConcept,
        description: "Updated description",
      });

      await service.update("uuid-1", { description: "Updated description" });

      expect(prisma.paymentConcept.findFirst).not.toHaveBeenCalled();
    });

    it("should throw ConflictError when update causes code collision", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.findFirst.mockResolvedValue({
        id: "other-uuid",
        code: "COLEGMES",
      });

      await expect(
        service.update("uuid-1", { code: "COLEGMES" }),
      ).rejects.toThrow(ConflictError);
      await expect(
        service.update("uuid-1", { code: "COLEGMES" }),
      ).rejects.toThrow("A payment concept with this code already exists");
    });

    it("should check code uniqueness excluding self when code changes", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(
        existingPaymentConcept,
      );
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.update.mockResolvedValue({
        ...existingPaymentConcept,
        code: "COLEGMES",
      });

      await service.update("uuid-1", { code: "COLEGMES" });

      expect(prisma.paymentConcept.findFirst).toHaveBeenCalledWith({
        where: {
          code: { equals: "COLEGMES", mode: "insensitive" },
          id: { not: "uuid-1" },
        },
      });
    });
  });

  // --- softDelete ---
  describe("softDelete", () => {
    it("should set isDeleted to true for an existing payment concept", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Inscripción",
        isDeleted: false,
      });
      prisma.paymentConcept.update.mockResolvedValue({
        id: "uuid-1",
        name: "Inscripción",
        isDeleted: true,
      });

      await service.softDelete("uuid-1");

      expect(prisma.paymentConcept.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { isDeleted: true },
      });
    });

    it("should throw NotFoundError when payment concept does not exist", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue(null);

      await expect(service.softDelete("non-existent")).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.softDelete("non-existent")).rejects.toThrow(
        "Payment concept not found",
      );
    });

    it("should throw ConflictError when payment concept is already deleted", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Inscripción",
        isDeleted: true,
      });

      await expect(service.softDelete("uuid-1")).rejects.toThrow(ConflictError);
      await expect(service.softDelete("uuid-1")).rejects.toThrow(
        "Payment concept is already deleted",
      );
    });
  });
});
