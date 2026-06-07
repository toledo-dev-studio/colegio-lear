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
          description: "Cuota de inscripción",
          baseAmount: 3500.0,
          allowForgiveness: true,
          status: true,
        },
      ];
      prisma.paymentConcept.findMany.mockResolvedValue(mockData);

      const result = await service.findAll({});

      expect(result).toEqual([
        {
          id: "uuid-1",
          name: "Inscripción",
          description: "Cuota de inscripción",
          baseAmount: 3500.0,
          allowForgiveness: true,
          status: true,
        },
      ]);
      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {},
      });
    });

    it("should apply q filter searching name and description", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ q: "inscripción" });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
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
          AND: [{ name: { contains: "Colegiatura", mode: "insensitive" } }],
        },
      });
    });

    it("should apply status filter", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ status: true });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ status: true }],
        },
      });
    });

    it("should apply allowForgiveness filter", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ allowForgiveness: false });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ allowForgiveness: false }],
        },
      });
    });

    it("should apply baseAmount filter (exact match)", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ baseAmount: 3500.0 });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ baseAmount: 3500.0 }],
        },
      });
    });

    it("should apply minAmount filter (gte)", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ minAmount: 2000.0 });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ baseAmount: { gte: 2000.0 } }],
        },
      });
    });

    it("should apply maxAmount filter (lte)", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ maxAmount: 5000.0 });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ baseAmount: { lte: 5000.0 } }],
        },
      });
    });

    it("should apply minAmount and maxAmount together (range filter)", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({ minAmount: 1000.0, maxAmount: 4000.0 });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { baseAmount: { gte: 1000.0 } },
            { baseAmount: { lte: 4000.0 } },
          ],
        },
      });
    });

    it("should combine multiple filters with AND logic", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);

      await service.findAll({
        q: "pago",
        name: "Inscripción",
        status: true,
        allowForgiveness: true,
        minAmount: 1000.0,
        maxAmount: 5000.0,
      });

      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: "pago", mode: "insensitive" } },
                { description: { contains: "pago", mode: "insensitive" } },
              ],
            },
            { name: { contains: "Inscripción", mode: "insensitive" } },
            { status: true },
            { allowForgiveness: true },
            { baseAmount: { gte: 1000.0 } },
            { baseAmount: { lte: 5000.0 } },
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
          description: "Cuota de inscripción",
          baseAmount: 3500.0,
          allowForgiveness: true,
          status: true,
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
            description: "Cuota de inscripción",
            baseAmount: 3500.0,
            allowForgiveness: true,
            status: true,
          },
        ],
        totalPages: 3,
        currentPage: 2,
        itemsCount: 15,
      });
      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
      });
      expect(prisma.paymentConcept.count).toHaveBeenCalledWith({ where: {} });
    });

    it("should apply filters together with pagination", async () => {
      prisma.paymentConcept.findMany.mockResolvedValue([]);
      prisma.paymentConcept.count.mockResolvedValue(0);

      const result = await service.findAllPaged(
        { status: false },
        { page: 1, pageSize: 10 },
      );

      expect(result).toEqual({
        data: [],
        totalPages: 0,
        currentPage: 1,
        itemsCount: 0,
      });
      expect(prisma.paymentConcept.findMany).toHaveBeenCalledWith({
        where: { AND: [{ status: false }] },
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
        description: "Cuota de inscripción al ciclo escolar",
        baseAmount: 3500.0,
        allowForgiveness: true,
        status: true,
      };
      prisma.paymentConcept.findUnique.mockResolvedValue(mockPaymentConcept);

      const result = await service.findById("uuid-1");

      expect(result).toEqual({
        id: "uuid-1",
        name: "Inscripción",
        description: "Cuota de inscripción al ciclo escolar",
        baseAmount: 3500.0,
        allowForgiveness: true,
        status: true,
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
      description: "Cuota de inscripción al ciclo escolar",
      baseAmount: 3500.0,
    };

    it("should create a payment concept successfully with valid data", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        status: true,
      });

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: "new-uuid",
        name: "Inscripción",
        description: "Cuota de inscripción al ciclo escolar",
        baseAmount: 3500.0,
        allowForgiveness: false,
        status: true,
      });
      expect(prisma.paymentConcept.create).toHaveBeenCalledWith({
        data: {
          name: validDto.name,
          description: validDto.description,
          baseAmount: validDto.baseAmount,
          allowForgiveness: false,
          status: true,
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

    it("should set status=true by default", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        status: true,
      });

      const result = await service.create(validDto);

      expect(result.status).toBe(true);
      expect(prisma.paymentConcept.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: true }),
        }),
      );
    });

    it("should set allowForgiveness to false by default when not provided", async () => {
      prisma.paymentConcept.findFirst.mockResolvedValue(null);
      prisma.paymentConcept.create.mockResolvedValue({
        id: "new-uuid",
        ...validDto,
        allowForgiveness: false,
        status: true,
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
        status: true,
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
        status: true,
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
      description: "Cuota de inscripción al ciclo escolar",
      baseAmount: 3500.0,
      allowForgiveness: true,
      status: true,
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
  });

  // --- softDelete ---
  describe("softDelete", () => {
    it("should set status to false for an active payment concept", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Inscripción",
        status: true,
      });
      prisma.paymentConcept.update.mockResolvedValue({
        id: "uuid-1",
        name: "Inscripción",
        status: false,
      });

      await service.softDelete("uuid-1");

      expect(prisma.paymentConcept.update).toHaveBeenCalledWith({
        where: { id: "uuid-1" },
        data: { status: false },
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

    it("should throw ConflictError when payment concept is already inactive", async () => {
      prisma.paymentConcept.findUnique.mockResolvedValue({
        id: "uuid-1",
        name: "Inscripción",
        status: false,
      });

      await expect(service.softDelete("uuid-1")).rejects.toThrow(ConflictError);
      await expect(service.softDelete("uuid-1")).rejects.toThrow(
        "Payment concept is already inactive",
      );
    });
  });
});
