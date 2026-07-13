import { PrismaClient } from "../../generated/prisma/client";
import { JobTitleType } from "../../generated/prisma/enums";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  JobTitleFilters,
  JobTitleRecord,
  PagedResult,
  CreateJobTitleDto,
  UpdateJobTitleDto,
  JobTitleTypes,
} from "./job-title.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";

/**
 * Maps frontend string values to Prisma enum values.
 * Frontend uses "administrative-staff" (hyphen), Prisma uses "administrative_staff" (underscore).
 */
function toPrismaJobTitleType(value: JobTitleTypes): JobTitleType {
  if (value === "administrative-staff") {
    return JobTitleType.administrative_staff;
  }
  return JobTitleType.teacher;
}

/**
 * Maps Prisma enum values to frontend string values.
 * Prisma uses "administrative_staff" (underscore), frontend uses "administrative-staff" (hyphen).
 * Exported for reuse by other modules that embed JobTitle (e.g. employees).
 */
export function toFrontendJobTitleType(value: JobTitleType): JobTitleTypes {
  if (value === JobTitleType.administrative_staff) {
    return "administrative-staff";
  }
  return "teacher";
}

/**
 * Maps a Prisma JobTitle row to the frontend-compatible JobTitleRecord interface.
 */
function toJobTitleRecord(row: {
  id: string;
  name: string;
  description: string | null;
  jobTitleType: JobTitleType;
  isActive: boolean;
}): JobTitleRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    jobTitleType: toFrontendJobTitleType(row.jobTitleType),
    isActive: row.isActive,
  };
}

/**
 * Business logic layer for the Job Titles module.
 * Handles CRUD operations, filtering, pagination, and uniqueness checks.
 * All queries operate directly on the `job_titles` table (flat entity, no relations).
 */
export class JobTitleService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided job title filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches both `name` and `description` with OR logic (case-insensitive).
   * The `jobTitleType` filter maps the frontend string to the Prisma enum value.
   */
  buildWhereClause(filters: JobTitleFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { isDeleted: false };
    const andConditions: unknown[] = [];

    // Full-text search across name and description (OR logic, case-insensitive)
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

    // JobTitleType filter (exact match using Prisma enum value)
    if (filters.jobTitleType) {
      andConditions.push({
        jobTitleType: toPrismaJobTitleType(filters.jobTitleType),
      });
    }

    // isActive filter (exact boolean match)
    if (filters.isActive !== undefined) {
      andConditions.push({ isActive: filters.isActive });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * List all job titles (no pagination) with optional filters.
   * Returns an array of JobTitleRecord with frontend-compatible jobTitleType values.
   */
  async findAll(filters: JobTitleFilters): Promise<JobTitleRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.jobTitle.findMany({ where });

    return results.map(toJobTitleRecord);
  }

  /**
   * List job titles with pagination and optional filters.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: JobTitleFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<JobTitleRecord>> {
    const where = this.buildWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.jobTitle.findMany({
        where,
        skip,
        take: pagination.limit,
      }),
      this.prisma.jobTitle.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map(toJobTitleRecord),
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single job title by ID.
   * Throws NotFoundError if the job title does not exist.
   */
  async findById(id: string): Promise<JobTitleRecord> {
    const jobTitle = await this.prisma.jobTitle.findUnique({
      where: { id },
    });

    if (!jobTitle || jobTitle.isDeleted) {
      throw new NotFoundError("Puesto no encontrado");
    }

    return toJobTitleRecord(jobTitle);
  }

  /**
   * Create a new job title.
   * Validates name uniqueness (case-insensitive).
   * Sets isActive = true by default when not provided.
   * Maps the frontend jobTitleType string to the Prisma enum value.
   * Throws ConflictError if a record with the same name already exists.
   */
  async create(dto: CreateJobTitleDto): Promise<JobTitleRecord> {
    // Check uniqueness: name (case-insensitive)
    const existing = await this.prisma.jobTitle.findFirst({
      where: {
        name: { equals: dto.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ConflictError("Ya existe un puesto con este nombre");
    }

    const created = await this.prisma.jobTitle.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        jobTitleType: toPrismaJobTitleType(dto.jobTitleType),
        isActive: dto.isActive ?? true,
      },
    });

    return toJobTitleRecord(created);
  }

  /**
   * Partial update of a job title.
   * Verifies the job title exists.
   * Checks name uniqueness (case-insensitive) when name changes, excluding the current record.
   * Maps the frontend jobTitleType string to the Prisma enum value when provided.
   * Throws NotFoundError if the record does not exist.
   * Throws ConflictError if the new name conflicts with another record.
   */
  async update(id: string, dto: UpdateJobTitleDto): Promise<JobTitleRecord> {
    // Verify job title exists
    const existing = await this.prisma.jobTitle.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Puesto no encontrado");
    }

    // Check uniqueness if name changed
    if (dto.name !== undefined) {
      const duplicate = await this.prisma.jobTitle.findFirst({
        where: {
          name: { equals: dto.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError("Ya existe un puesto con este nombre");
      }
    }

    // Build the update data
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.jobTitleType !== undefined) {
      updateData.jobTitleType = toPrismaJobTitleType(dto.jobTitleType);
    }
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.prisma.jobTitle.update({
      where: { id },
      data: updateData,
    });

    return toJobTitleRecord(updated);
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the job title does not exist.
   * Throws ConflictError if the job title is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.jobTitle.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Puesto no encontrado");
    }

    if (existing.isDeleted) {
      throw new ConflictError("El puesto ya fue eliminado");
    }

    await this.prisma.jobTitle.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
