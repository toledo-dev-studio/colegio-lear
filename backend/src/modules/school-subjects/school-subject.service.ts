import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  SubjectFilters,
  SubjectView,
  PagedResult,
  CreateSchoolSubjectDto,
  UpdateSchoolSubjectDto,
  SchoolSubjectRecord,
} from "./school-subject.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";

/**
 * Business logic layer for the School Subjects module.
 * Handles CRUD operations, filtering, pagination, FK validation, and uniqueness checks.
 * Read operations use Prisma include for nested objects; write operations target the `schoolSubject` table.
 */
export class SchoolSubjectService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches both `name` and `description` with OR logic (case-insensitive).
   */
  private buildWhereClause(filters: SubjectFilters) {
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

    // Status filter
    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    // Academic level filter
    if (filters.academicLevelId) {
      andConditions.push({ academicLevelId: filters.academicLevelId });
    }

    // Education level filter
    if (filters.educationLevelId) {
      andConditions.push({ educationLevelId: filters.educationLevelId });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * List all subjects (no pagination) with optional filters.
   * Uses Prisma include to return nested academicLevel and educationLevel objects.
   */
  async findAll(filters: SubjectFilters): Promise<SubjectView[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.schoolSubject.findMany({
      where,
      include: {
        academicLevel: { select: { id: true, name: true } },
        educationLevel: { select: { id: true, name: true } },
      },
    });

    return results as unknown as SubjectView[];
  }

  /**
   * List subjects with pagination and optional filters.
   * Uses Prisma include to return nested academicLevel and educationLevel objects.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: SubjectFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<SubjectView>> {
    const where = this.buildWhereClause(filters);

    const [data, itemsCount] = await Promise.all([
      this.prisma.schoolSubject.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: {
          academicLevel: { select: { id: true, name: true } },
          educationLevel: { select: { id: true, name: true } },
        },
      }),
      this.prisma.schoolSubject.count({ where }),
    ]);

    const totalPages = Math.ceil(itemsCount / pagination.limit);

    return {
      data: data as unknown as SubjectView[],
      totalPages,
      currentPage: pagination.page,
      itemsCount,
    };
  }

  /**
   * Find a single subject by ID.
   * Uses Prisma include to return nested academicLevel and educationLevel objects.
   * Throws NotFoundError if the subject does not exist.
   */
  async findById(id: string): Promise<SubjectView> {
    const subject = await this.prisma.schoolSubject.findUnique({
      where: { id },
      include: {
        academicLevel: { select: { id: true, name: true } },
        educationLevel: { select: { id: true, name: true } },
      },
    });

    if (!subject) {
      throw new NotFoundError("School subject not found");
    }

    return subject as unknown as SubjectView;
  }

  /**
   * Create a new school subject.
   * Validates that academicLevelId and educationLevelId reference existing records.
   * Checks uniqueness of name + educationLevelId (case-insensitive).
   * Sets status = true by default.
   */
  async create(dto: CreateSchoolSubjectDto): Promise<SchoolSubjectRecord> {
    // Validate academicLevelId exists (checked first per Requirement 5.7)
    const academicLevel = await this.prisma.academicLevel.findUnique({
      where: { id: dto.academicLevelId },
    });

    if (!academicLevel) {
      throw new NotFoundError("Academic level not found");
    }

    // Validate educationLevelId exists
    const educationLevel = await this.prisma.educationLevel.findUnique({
      where: { id: dto.educationLevelId },
    });

    if (!educationLevel) {
      throw new NotFoundError("Education level not found");
    }

    // Check uniqueness: name + educationLevelId (case-insensitive)
    const existing = await this.prisma.schoolSubject.findFirst({
      where: {
        name: { equals: dto.name, mode: "insensitive" },
        educationLevelId: dto.educationLevelId,
      },
    });

    if (existing) {
      throw new ConflictError(
        "A subject with this name already exists for the selected education level",
      );
    }

    const created = await this.prisma.schoolSubject.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        status: true,
        academicLevelId: dto.academicLevelId,
        educationLevelId: dto.educationLevelId,
      },
    });

    return created as SchoolSubjectRecord;
  }

  /**
   * Partial update of a school subject.
   * Verifies the subject exists, validates FKs if provided,
   * and checks uniqueness if name or educationLevelId changed.
   */
  async update(
    id: string,
    dto: UpdateSchoolSubjectDto,
  ): Promise<SchoolSubjectRecord> {
    // Verify subject exists
    const existing = await this.prisma.schoolSubject.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("School subject not found");
    }

    // Validate academicLevelId if provided
    if (dto.academicLevelId) {
      const academicLevel = await this.prisma.academicLevel.findUnique({
        where: { id: dto.academicLevelId },
      });

      if (!academicLevel) {
        throw new NotFoundError("Academic level not found");
      }
    }

    // Validate educationLevelId if provided
    if (dto.educationLevelId) {
      const educationLevel = await this.prisma.educationLevel.findUnique({
        where: { id: dto.educationLevelId },
      });

      if (!educationLevel) {
        throw new NotFoundError("Education level not found");
      }
    }

    // Check uniqueness if name or educationLevelId changed
    const newName = dto.name ?? existing.name;
    const newEducationLevelId =
      dto.educationLevelId ?? existing.educationLevelId;

    if (dto.name !== undefined || dto.educationLevelId !== undefined) {
      const duplicate = await this.prisma.schoolSubject.findFirst({
        where: {
          name: { equals: newName, mode: "insensitive" },
          educationLevelId: newEducationLevelId,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError(
          "A subject with this name already exists for the selected education level",
        );
      }
    }

    // Update the record
    const updated = await this.prisma.schoolSubject.update({
      where: { id },
      data: dto,
    });

    return updated as SchoolSubjectRecord;
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the subject does not exist.
   * Throws ConflictError if the subject is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.schoolSubject.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("School subject not found");
    }

    if (existing.isDeleted) {
      throw new ConflictError("School subject is already deleted");
    }

    await this.prisma.schoolSubject.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
