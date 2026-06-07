import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  PaymentConceptFilters,
  PaymentConceptRecord,
  PagedResult,
  CreatePaymentConceptDto,
  UpdatePaymentConceptDto,
} from "./payment-concept.types";

/** Pagination parameters for the paged endpoint. */
interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Business logic layer for the Payment Concepts module.
 * Handles CRUD operations, filtering, pagination, uniqueness checks, and soft delete.
 * All queries operate directly on the `payment_concepts` table (no includes needed).
 */
export class PaymentConceptService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches both `name` and `description` with OR logic (case-insensitive).
   */
  private buildWhereClause(filters: PaymentConceptFilters) {
    const where: Record<string, unknown> = { isDeleted: false };
    const andConditions: unknown[] = [];

    // Full-text search across name and description (case-insensitive contains)
    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      });
    }

    // Name filter (case-insensitive contains)
    if (filters.name) {
      andConditions.push({
        name: { contains: filters.name, mode: "insensitive" },
      });
    }

    // Status filter (exact match)
    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    // Allow forgiveness filter (exact match)
    if (filters.allowForgiveness !== undefined) {
      andConditions.push({ allowForgiveness: filters.allowForgiveness });
    }

    // Amount filter (exact match)
    if (filters.amount !== undefined) {
      andConditions.push({ baseAmount: filters.amount });
    }

    // Min amount filter (greater than or equal)
    if (filters.minAmount !== undefined) {
      andConditions.push({ baseAmount: { gte: filters.minAmount } });
    }

    // Max amount filter (less than or equal)
    if (filters.maxAmount !== undefined) {
      andConditions.push({ baseAmount: { lte: filters.maxAmount } });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * Convert a raw Prisma payment concept record to a PaymentConceptRecord,
   * converting the Decimal `baseAmount` field to `amount` as a plain number.
   */
  private toRecord(raw: Record<string, unknown>): PaymentConceptRecord {
    return {
      id: raw.id as string,
      name: raw.name as string,
      description: raw.description as string,
      amount: Number(raw.baseAmount),
      allowForgiveness: raw.allowForgiveness as boolean,
      status: raw.status as boolean,
    };
  }

  /**
   * List all payment concepts (no pagination) with optional filters.
   * Queries the paymentConcept table directly (no includes).
   */
  async findAll(
    filters: PaymentConceptFilters,
  ): Promise<PaymentConceptRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.paymentConcept.findMany({ where });

    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  /**
   * List payment concepts with pagination and optional filters.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: PaymentConceptFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<PaymentConceptRecord>> {
    const where = this.buildWhereClause(filters);

    const [data, itemsCount] = await Promise.all([
      this.prisma.paymentConcept.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.paymentConcept.count({ where }),
    ]);

    const totalPages = Math.ceil(itemsCount / pagination.pageSize);

    return {
      data: data.map((r) =>
        this.toRecord(r as unknown as Record<string, unknown>),
      ),
      totalPages,
      currentPage: pagination.page,
      itemsCount,
    };
  }

  /**
   * Find a single payment concept by ID.
   * Throws NotFoundError if the payment concept does not exist or is deleted.
   */
  async findById(id: string): Promise<PaymentConceptRecord> {
    const paymentConcept = await this.prisma.paymentConcept.findUnique({
      where: { id },
    });

    if (!paymentConcept || paymentConcept.isDeleted) {
      throw new NotFoundError("Payment concept not found");
    }

    return this.toRecord(paymentConcept as unknown as Record<string, unknown>);
  }

  /**
   * Create a new payment concept.
   * Validates name uniqueness (case-insensitive) before insert.
   * Sets status = true and allowForgiveness to dto value or false by default.
   */
  async create(dto: CreatePaymentConceptDto): Promise<PaymentConceptRecord> {
    // Check uniqueness: name (case-insensitive)
    const existing = await this.prisma.paymentConcept.findFirst({
      where: {
        name: { equals: dto.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ConflictError(
        "A payment concept with this name already exists",
      );
    }

    const created = await this.prisma.paymentConcept.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        baseAmount: dto.amount,
        allowForgiveness: dto.allowForgiveness ?? false,
        status: true,
      },
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  /**
   * Partial update of a payment concept.
   * Verifies the payment concept exists, and checks name uniqueness
   * when the name changes (excluding self).
   */
  async update(
    id: string,
    dto: UpdatePaymentConceptDto,
  ): Promise<PaymentConceptRecord> {
    // Verify payment concept exists
    const existing = await this.prisma.paymentConcept.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Payment concept not found");
    }

    // Check uniqueness if name is being changed
    if (dto.name !== undefined) {
      const duplicate = await this.prisma.paymentConcept.findFirst({
        where: {
          name: { equals: dto.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError(
          "A payment concept with this name already exists",
        );
      }
    }

    // Build update data mapping `amount` to Prisma's `baseAmount`
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.amount !== undefined) updateData.baseAmount = dto.amount;
    if (dto.allowForgiveness !== undefined)
      updateData.allowForgiveness = dto.allowForgiveness;
    if (dto.status !== undefined) updateData.status = dto.status;

    // Update the record
    const updated = await this.prisma.paymentConcept.update({
      where: { id },
      data: updateData,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the payment concept does not exist.
   * Throws ConflictError if the payment concept is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.paymentConcept.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Payment concept not found");
    }

    if (existing.isDeleted) {
      throw new ConflictError("Payment concept is already deleted");
    }

    await this.prisma.paymentConcept.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
