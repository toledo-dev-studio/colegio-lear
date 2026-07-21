import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  ScholarshipFilters,
  ScholarshipRecord,
  PagedResult,
  CreateScholarshipDto,
  UpdateScholarshipDto,
} from "./scholarship.types";

/** Pagination parameters for the paged endpoint. */
interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Business logic layer for the Scholarships module.
 * Handles CRUD operations, filtering, pagination, uniqueness checks, and soft delete.
 * All queries operate directly on the `scholarships` table (no includes needed).
 */
export class ScholarshipService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches both `name` and `description` with OR logic (case-insensitive).
   */
  private buildWhereClause(filters: ScholarshipFilters) {
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

    // isActive filter (exact match)
    if (filters.isActive !== undefined) {
      andConditions.push({ isActive: filters.isActive });
    }

    // Discount percentage filter (maximum — matches scholarships at or below this value)
    if (filters.discountPercentage !== undefined) {
      andConditions.push({
        discountPercentage: { lte: filters.discountPercentage },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * Convert a raw Prisma scholarship record to a ScholarshipRecord,
   * converting the Decimal `discountPercentage` field to a plain number.
   */
  private toRecord(raw: Record<string, unknown>): ScholarshipRecord {
    return {
      id: raw.id as string,
      name: raw.name as string,
      description: raw.description as string,
      discountPercentage: Number(raw.discountPercentage),
      isActive: raw.isActive as boolean,
    };
  }

  /**
   * List all scholarships (no pagination) with optional filters.
   * Queries the scholarship table directly (no includes).
   */
  async findAll(filters: ScholarshipFilters): Promise<ScholarshipRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.scholarship.findMany({ where });

    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  /**
   * List scholarships with pagination and optional filters.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: ScholarshipFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<ScholarshipRecord>> {
    const where = this.buildWhereClause(filters);

    const [data, itemsCount] = await Promise.all([
      this.prisma.scholarship.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.scholarship.count({ where }),
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
   * Find a single scholarship by ID.
   * Throws NotFoundError if the scholarship does not exist.
   */
  async findById(id: string): Promise<ScholarshipRecord> {
    const scholarship = await this.prisma.scholarship.findUnique({
      where: { id },
    });

    if (!scholarship || scholarship.isDeleted) {
      throw new NotFoundError("Scholarship not found");
    }

    return this.toRecord(scholarship as unknown as Record<string, unknown>);
  }

  /**
   * Create a new scholarship.
   * Validates name uniqueness (case-insensitive) before insert.
   * Sets isActive = true by default (or dto.isActive when provided).
   */
  async create(dto: CreateScholarshipDto): Promise<ScholarshipRecord> {
    // Check uniqueness: name (case-insensitive)
    const existing = await this.prisma.scholarship.findFirst({
      where: {
        name: { equals: dto.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ConflictError("A scholarship with this name already exists");
    }

    const created = await this.prisma.scholarship.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        discountPercentage: dto.discountPercentage,
        isActive: dto.isActive ?? true,
      },
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  /**
   * Partial update of a scholarship.
   * Verifies the scholarship exists, and checks name uniqueness
   * when the name changes (excluding self).
   */
  async update(
    id: string,
    dto: UpdateScholarshipDto,
  ): Promise<ScholarshipRecord> {
    // Verify scholarship exists
    const existing = await this.prisma.scholarship.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Scholarship not found");
    }

    // Check uniqueness if name is being changed
    if (dto.name !== undefined) {
      const duplicate = await this.prisma.scholarship.findFirst({
        where: {
          name: { equals: dto.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError("A scholarship with this name already exists");
      }
    }

    // Update the record
    const updated = await this.prisma.scholarship.update({
      where: { id },
      data: dto,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the scholarship does not exist.
   * Throws ConflictError if the scholarship is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.scholarship.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Scholarship not found");
    }

    if (existing.isDeleted) {
      throw new ConflictError("Scholarship is already deleted");
    }

    await this.prisma.scholarship.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
