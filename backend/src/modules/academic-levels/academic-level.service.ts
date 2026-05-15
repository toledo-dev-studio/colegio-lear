import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  AcademicLevelFilters,
  AcademicLevelView,
  AcademicLevelDetail,
  AcademicLevelRecord,
  EducationLevelFilters,
  EducationLevelView,
  PagedResult,
  CreateAcademicLevelDto,
  UpdateAcademicLevelDto,
} from "./academic-level.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";

/**
 * Business logic layer for the Academic Levels module.
 * Handles CRUD operations, filtering, pagination, and uniqueness checks.
 * Read operations for lists query the `vAcademicLevel` view;
 * findById queries the `academicLevel` table with includes.
 * Write operations target the `academicLevel` table directly.
 */
export class AcademicLevelService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided academic level filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches both `name` and `description` with OR logic (case-insensitive).
   */
  private buildWhereClause(
    filters: AcademicLevelFilters,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    const andConditions: unknown[] = [];

    // Full-text search across name and description
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

    // Status filter (exact boolean match)
    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * Build a Prisma `where` clause for education levels filters.
   * Supports `q` (name contains), `academicLevelId` (exact match),
   * and `status` (relation filter on parent academic level status).
   * All active filters are combined with AND logic.
   */
  private buildEducationLevelWhereClause(
    filters: EducationLevelFilters,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    const andConditions: unknown[] = [];

    // Search on education level name
    if (filters.q) {
      andConditions.push({
        name: { contains: filters.q, mode: "insensitive" },
      });
    }

    // Filter by parent academic level ID
    if (filters.academicLevelId) {
      andConditions.push({ academicLevelId: filters.academicLevelId });
    }

    // Filter by parent academic level status (relation filter)
    if (filters.status !== undefined) {
      andConditions.push({
        academicLevel: { status: filters.status },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * List all academic levels (no pagination) with optional filters.
   * Reads from the v_academic_levels view.
   */
  async findAll(filters: AcademicLevelFilters): Promise<AcademicLevelView[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.vAcademicLevel.findMany({ where });

    return results as AcademicLevelView[];
  }

  /**
   * List academic levels with pagination and optional filters.
   * Reads from the v_academic_levels view.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: AcademicLevelFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<AcademicLevelView>> {
    const where = this.buildWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.vAcademicLevel.findMany({
        where,
        skip,
        take: pagination.limit,
      }),
      this.prisma.vAcademicLevel.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data as AcademicLevelView[],
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single academic level by ID with its education levels.
   * Reads from the academicLevel table with include for educationLevels.
   * Throws NotFoundError if the academic level does not exist.
   */
  async findById(id: string): Promise<AcademicLevelDetail> {
    const academicLevel = await this.prisma.academicLevel.findUnique({
      where: { id },
      include: { educationLevels: true },
    });

    if (!academicLevel) {
      throw new NotFoundError("Academic level not found");
    }

    return {
      id: academicLevel.id,
      name: academicLevel.name,
      description: academicLevel.description,
      status: academicLevel.status,
      educationLevels: academicLevel.educationLevels.map((el) => ({
        id: el.id,
        name: el.name,
        description: el.description,
        academicLevelId: el.academicLevelId,
      })),
    };
  }

  /**
   * Create a new academic level.
   * Validates name uniqueness (case-insensitive).
   * Sets status = true by default.
   * Throws ConflictError if a record with the same name already exists.
   */
  async create(dto: CreateAcademicLevelDto): Promise<AcademicLevelRecord> {
    // Check uniqueness: name (case-insensitive)
    const existing = await this.prisma.academicLevel.findFirst({
      where: {
        name: { equals: dto.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ConflictError(
        "An academic level with this name already exists",
      );
    }

    // Create the record with status = true
    const created = await this.prisma.academicLevel.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: true,
      },
    });

    return created as AcademicLevelRecord;
  }

  /**
   * Partial update of an academic level.
   * Verifies the academic level exists.
   * Checks name uniqueness (case-insensitive) when name changes, excluding the current record.
   * Throws NotFoundError if the record does not exist.
   * Throws ConflictError if the new name conflicts with another record.
   */
  async update(
    id: string,
    dto: UpdateAcademicLevelDto,
  ): Promise<AcademicLevelRecord> {
    // Verify academic level exists
    const existing = await this.prisma.academicLevel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Academic level not found");
    }

    // Check uniqueness if name changed
    if (dto.name !== undefined) {
      const duplicate = await this.prisma.academicLevel.findFirst({
        where: {
          name: { equals: dto.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError(
          "An academic level with this name already exists",
        );
      }
    }

    // Update the record
    const updated = await this.prisma.academicLevel.update({
      where: { id },
      data: dto,
    });

    return updated as AcademicLevelRecord;
  }

  /**
   * Soft delete: sets status = false without removing the record.
   * Throws NotFoundError if the academic level does not exist.
   * Throws ConflictError if the academic level is already inactive.
   */
  async softDelete(id: string): Promise<void> {
    // Verify academic level exists
    const existing = await this.prisma.academicLevel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Academic level not found");
    }

    // Verify status is true (not already inactive)
    if (!existing.status) {
      throw new ConflictError("Academic level is already inactive");
    }

    // Set status to false
    await this.prisma.academicLevel.update({
      where: { id },
      data: { status: false },
    });
  }

  /**
   * List education levels with pagination and optional filters.
   * Reads from the educationLevel table.
   * Supports filtering by `q` (name contains), `academicLevelId`, and `status` (parent relation).
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findEducationLevelsPaged(
    filters: EducationLevelFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<EducationLevelView>> {
    const where = this.buildEducationLevelWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.educationLevel.findMany({
        where,
        skip,
        take: pagination.limit,
      }),
      this.prisma.educationLevel.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((el) => ({
        id: el.id,
        name: el.name,
        description: el.description,
        academicLevelId: el.academicLevelId,
      })),
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }
}
