import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  AcademicLevelFilters,
  AcademicLevelDetail,
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
    const where: Record<string, unknown> = { isDeleted: false };
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
   * Uses Prisma include to return nested education levels.
   */
  async findAll(filters: AcademicLevelFilters): Promise<AcademicLevelDetail[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.academicLevel.findMany({
      where,
      include: { educationLevels: true },
    });

    return results.map((al) => ({
      id: al.id,
      name: al.name,
      description: al.description,
      status: al.status,
      educationLevels: al.educationLevels.map((el) => ({
        id: el.id,
        name: el.name,
        description: el.description,
        academicLevelId: el.academicLevelId,
      })),
    }));
  }

  /**
   * List academic levels with pagination and optional filters.
   * Uses Prisma include to return nested education levels.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: AcademicLevelFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<AcademicLevelDetail>> {
    const where = this.buildWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.academicLevel.findMany({
        where,
        skip,
        take: pagination.limit,
        include: { educationLevels: true },
      }),
      this.prisma.academicLevel.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((al) => ({
        id: al.id,
        name: al.name,
        description: al.description,
        status: al.status,
        educationLevels: al.educationLevels.map((el) => ({
          id: el.id,
          name: el.name,
          description: el.description,
          academicLevelId: el.academicLevelId,
        })),
      })),
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

    if (!academicLevel || academicLevel.isDeleted) {
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
   * Create a new academic level with optional nested education levels.
   * Validates name uniqueness (case-insensitive).
   * Sets status = true by default.
   * Creates education levels in the same transaction if provided.
   * Throws ConflictError if a record with the same name already exists.
   */
  async create(dto: CreateAcademicLevelDto): Promise<AcademicLevelDetail> {
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

    const created = await this.prisma.academicLevel.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        status: true,
        ...(dto.educationLevels && dto.educationLevels.length > 0
          ? {
              educationLevels: {
                create: dto.educationLevels.map((el) => ({
                  name: el.name,
                  description: el.description ?? null,
                })),
              },
            }
          : {}),
      },
      include: { educationLevels: true },
    });

    return {
      id: created.id,
      name: created.name,
      description: created.description,
      status: created.status,
      educationLevels: created.educationLevels.map((el) => ({
        id: el.id,
        name: el.name,
        description: el.description,
        academicLevelId: el.academicLevelId,
      })),
    };
  }

  /**
   * Partial update of an academic level with nested education levels sync.
   * Verifies the academic level exists.
   * Checks name uniqueness (case-insensitive) when name changes, excluding the current record.
   * Syncs education levels: creates new ones (id starts with "new-"), updates existing, deletes removed.
   * Throws NotFoundError if the record does not exist.
   * Throws ConflictError if the new name conflicts with another record.
   */
  async update(
    id: string,
    dto: UpdateAcademicLevelDto,
  ): Promise<AcademicLevelDetail> {
    // Verify academic level exists
    const existing = await this.prisma.academicLevel.findUnique({
      where: { id },
      include: { educationLevels: true },
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

    // Build the update data for the academic level fields
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;

    // Sync education levels if provided
    if (dto.educationLevels !== undefined) {
      const incomingIds = dto.educationLevels
        .filter((el) => !el.id.startsWith("new-"))
        .map((el) => el.id);

      // Delete education levels that are no longer in the list
      const toDelete = existing.educationLevels
        .filter((el) => !incomingIds.includes(el.id))
        .map((el) => el.id);

      if (toDelete.length > 0) {
        await this.prisma.educationLevel.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // Create new education levels (id starts with "new-")
      const toCreate = dto.educationLevels.filter((el) =>
        el.id.startsWith("new-"),
      );

      if (toCreate.length > 0) {
        await this.prisma.educationLevel.createMany({
          data: toCreate.map((el) => ({
            name: el.name,
            description: el.description ?? null,
            academicLevelId: id,
          })),
        });
      }

      // Update existing education levels
      const toUpdate = dto.educationLevels.filter(
        (el) => !el.id.startsWith("new-"),
      );

      for (const el of toUpdate) {
        await this.prisma.educationLevel.update({
          where: { id: el.id },
          data: {
            name: el.name,
            description: el.description ?? null,
          },
        });
      }
    }

    // Update the academic level itself
    const updated = await this.prisma.academicLevel.update({
      where: { id },
      data: updateData,
      include: { educationLevels: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      educationLevels: updated.educationLevels.map((el) => ({
        id: el.id,
        name: el.name,
        description: el.description,
        academicLevelId: el.academicLevelId,
      })),
    };
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the academic level does not exist.
   * Throws ConflictError if the academic level is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.academicLevel.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Academic level not found");
    }

    if (existing.isDeleted) {
      throw new ConflictError("Academic level is already deleted");
    }

    await this.prisma.academicLevel.update({
      where: { id },
      data: { isDeleted: true },
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
