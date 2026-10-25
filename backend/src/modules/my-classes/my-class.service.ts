import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { calculateSkip, buildPaginationMeta } from "../../shared/helpers/pagination.helper";
import type { AcademicCycleStatus } from "../academic-cycles/academic-cycle.types";
import type {
  MyClassFilters,
  MyClassRecord,
  PaginationParams,
  PagedResult,
} from "./my-class.types";

/**
 * Business logic for the teacher-facing "my classes" list. A class is an
 * AcademicCycleGroup the authenticated teacher is assigned to teach at
 * least one subject in, resolved through AcademicCycleGroupCalendar.teacherId
 * — there's no direct FK from group to teacher, since a group has one
 * teacher per subject and this is each teacher's own filtered view.
 */
export class MyClassService {
  constructor(private readonly prisma: PrismaClient) {}

  private toRecord(raw: Record<string, unknown>): MyClassRecord {
    const cycle = raw.academicCycle as Record<string, unknown> | null;
    return {
      id: raw.id as string,
      name: raw.name as string,
      status: raw.status as MyClassRecord["status"],
      ...(cycle
        ? {
            academicCycle: {
              id: cycle.id as string,
              name: cycle.name as string,
              code: cycle.code as string,
              periodType: cycle.periodType as string,
              status: cycle.status as AcademicCycleStatus,
              minimumPassingGrade: cycle.minimumPassingGrade as number,
              evaluationCount: cycle.evaluationCount as number,
              startDate: (cycle.startDate as Date).toISOString(),
              endDate: (cycle.endDate as Date).toISOString(),
            },
          }
        : {}),
    };
  }

  private buildWhereClause(teacherId: string, filters: MyClassFilters) {
    const where: Record<string, unknown> = {
      calendars: { some: { teacherId } },
    };
    const andConditions: unknown[] = [];

    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { academicCycle: { name: { contains: filters.q, mode: "insensitive" } } },
        ],
      });
    }

    if (filters.name) {
      andConditions.push({ name: { contains: filters.name, mode: "insensitive" } });
    }

    if (filters.status) {
      andConditions.push({ status: filters.status as never });
    }

    if (filters.academicCycleStatus) {
      andConditions.push({
        academicCycle: { status: filters.academicCycleStatus as never },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /** GET paginated classes (school groups) assigned to the teacher */
  async findAllPaged(
    teacherId: string,
    filters: MyClassFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<MyClassRecord>> {
    const where = this.buildWhereClause(teacherId, filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.academicCycleGroup.findMany({
        where,
        include: { academicCycle: true },
        skip,
        take: pagination.limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.academicCycleGroup.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((r) => this.toRecord(r as unknown as Record<string, unknown>)),
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /** GET a single class by id — 404 if it doesn't exist or isn't the teacher's own */
  async findById(teacherId: string, id: string): Promise<MyClassRecord> {
    const record = await this.prisma.academicCycleGroup.findFirst({
      where: { id, calendars: { some: { teacherId } } },
      include: { academicCycle: true },
    });

    if (!record) {
      throw new NotFoundError("Clase no encontrada");
    }

    return this.toRecord(record as unknown as Record<string, unknown>);
  }
}
