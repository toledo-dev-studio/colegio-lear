import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  AcademicCycleFilters,
  AcademicCycleRecord,
  PagedResult,
  CreateAcademicCycleDto,
  UpdateAcademicCycleDto,
  AcademicPeriodType,
} from "./academic-cycle.types";

interface PaginationParams {
  page: number;
  pageSize: number;
}

// ─── Enum Mappings ──────────────────────────────────────────────────────────

/** Maps frontend type values to Prisma enum field names */
const TYPE_TO_PRISMA: Record<string, string> = {
  "four-month-period": "four_month_period",
};

/** Maps Prisma enum field names to frontend type values */
const TYPE_FROM_PRISMA: Record<string, AcademicPeriodType> = {
  four_month_period: "four-month-period",
};

function typeToPrisma(value: string): string {
  return TYPE_TO_PRISMA[value] ?? value;
}

function typeFromPrisma(value: string): AcademicPeriodType {
  return (TYPE_FROM_PRISMA[value] ?? value) as AcademicPeriodType;
}

// ─── Include clause for related entities ────────────────────────────────────

const INCLUDE_RELATIONS = {
  academicLevel: { select: { id: true, name: true } },
  educationLevel: { select: { id: true, name: true } },
};

/**
 * Business logic layer for the Academic Cycles module.
 */
export class AcademicCycleService {
  constructor(private readonly prisma: PrismaClient) {}

  private buildWhereClause(filters: AcademicCycleFilters) {
    const where: Record<string, unknown> = {};
    const andConditions: unknown[] = [];

    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { code: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      });
    }

    if (filters.name) {
      andConditions.push({
        name: { contains: filters.name, mode: "insensitive" },
      });
    }

    if (filters.code) {
      andConditions.push({
        code: { contains: filters.code, mode: "insensitive" },
      });
    }

    if (filters.startDate) {
      andConditions.push({
        startDate: { gte: new Date(filters.startDate) },
      });
    }

    if (filters.endDate) {
      andConditions.push({
        endDate: { lte: new Date(filters.endDate) },
      });
    }

    if (filters.periodType) {
      andConditions.push({
        periodType: typeToPrisma(filters.periodType) as never,
      });
    }

    if (filters.enrollmentOpen !== undefined) {
      andConditions.push({ enrollmentOpen: filters.enrollmentOpen });
    }

    if (filters.status) {
      andConditions.push({ status: filters.status as never });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  private toRecord(raw: Record<string, unknown>): AcademicCycleRecord {
    return {
      id: raw.id as string,
      name: raw.name as string,
      code: raw.code as string,
      startDate: (raw.startDate as Date).toISOString(),
      endDate: (raw.endDate as Date).toISOString(),
      periodType: typeFromPrisma(raw.periodType as string),
      status: raw.status as AcademicCycleRecord["status"],
      minimumPassingGrade: raw.minimumPassingGrade as number,
      evaluationCount: raw.evaluationCount as number,
      enrollmentOpen: raw.enrollmentOpen as boolean,
      description: raw.description as string | null,
      observations: raw.observations as string | null,
      academicLevelId: raw.academicLevelId as string,
      educationLevelId: raw.educationLevelId as string,
      academicLevel: raw.academicLevel as { id: string; name: string },
      educationLevel: raw.educationLevel as { id: string; name: string },
      createdAt: (raw.createdAt as Date).toISOString(),
      updatedAt: (raw.updatedAt as Date).toISOString(),
    };
  }

  /** GET all academic cycles with optional filters */
  async findAll(filters: AcademicCycleFilters): Promise<AcademicCycleRecord[]> {
    const where = this.buildWhereClause(filters);
    const results = await this.prisma.academicCycle.findMany({
      where,
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: "desc" },
    });
    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  /** GET paginated academic cycles */
  async findAllPaged(
    filters: AcademicCycleFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<AcademicCycleRecord>> {
    const where = this.buildWhereClause(filters);

    const [data, itemsCount] = await Promise.all([
      this.prisma.academicCycle.findMany({
        where,
        include: INCLUDE_RELATIONS,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.academicCycle.count({ where }),
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

  /** GET a single academic cycle by ID */
  async findById(id: string): Promise<AcademicCycleRecord> {
    const record = await this.prisma.academicCycle.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });

    if (!record) {
      throw new NotFoundError("Academic cycle not found");
    }

    return this.toRecord(record as unknown as Record<string, unknown>);
  }

  /** POST create a new academic cycle */
  async create(dto: CreateAcademicCycleDto): Promise<AcademicCycleRecord> {
    // Check uniqueness: code
    const existingCode = await this.prisma.academicCycle.findUnique({
      where: { code: dto.code },
    });
    if (existingCode) {
      throw new ConflictError(
        "An academic cycle with this code already exists",
      );
    }

    const created = await this.prisma.academicCycle.create({
      data: {
        name: dto.name,
        code: dto.code,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        periodType: typeToPrisma(dto.periodType) as never,
        status: (dto.status ?? "upcoming") as never,
        minimumPassingGrade: dto.minimumPassingGrade ?? 6,
        evaluationCount: dto.evaluationCount ?? 3,
        enrollmentOpen: dto.enrollmentOpen ?? false,
        description: dto.description ?? null,
        observations: dto.observations ?? null,
        academicLevelId: dto.academicLevelId,
        educationLevelId: dto.educationLevelId,
      },
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  /** PATCH update an academic cycle */
  async update(
    id: string,
    dto: UpdateAcademicCycleDto,
  ): Promise<AcademicCycleRecord> {
    const existing = await this.prisma.academicCycle.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError("Academic cycle not found");

    // Check uniqueness if code is changing
    if (dto.code !== undefined && dto.code !== existing.code) {
      const dup = await this.prisma.academicCycle.findUnique({
        where: { code: dto.code },
      });
      if (dup) {
        throw new ConflictError(
          "An academic cycle with this code already exists",
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.startDate !== undefined)
      updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);
    if (dto.periodType !== undefined)
      updateData.periodType = typeToPrisma(dto.periodType);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.minimumPassingGrade !== undefined)
      updateData.minimumPassingGrade = dto.minimumPassingGrade;
    if (dto.evaluationCount !== undefined)
      updateData.evaluationCount = dto.evaluationCount;
    if (dto.enrollmentOpen !== undefined)
      updateData.enrollmentOpen = dto.enrollmentOpen;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;
    if (dto.academicLevelId !== undefined)
      updateData.academicLevelId = dto.academicLevelId;
    if (dto.educationLevelId !== undefined)
      updateData.educationLevelId = dto.educationLevelId;

    const updated = await this.prisma.academicCycle.update({
      where: { id },
      data: updateData,
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  /** DELETE — sets status to "cancelled" (no isDeleted field) */
  async remove(id: string): Promise<void> {
    const existing = await this.prisma.academicCycle.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError("Academic cycle not found");

    await this.prisma.academicCycle.update({
      where: { id },
      data: { status: "cancelled" as never },
    });
  }
}
