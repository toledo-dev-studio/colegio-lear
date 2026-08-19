import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  StudentAssistRecord,
  StudentAssistFilters,
  CreateStudentAssistDto,
  UpdateStudentAssistDto,
  PagedResult,
} from "./student-assist.types";

interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Business logic for the student attendance sub-resource. Shared by both
 * the employee CRUD controller and the student-portal read-only controller
 * (see student-assist-student.controller.ts, reached via gateStudentSession
 * on the shared GET .../assists URL) — the student side only ever calls
 * findAllPaged, with its own ownership check layered on top.
 */
export class StudentAssistService {
  constructor(private readonly prisma: PrismaClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toRecord(raw: any): StudentAssistRecord {
    return {
      id: raw.id,
      academicCycleEnrollmentId: raw.academicCycleEnrollmentId,
      assistDate: raw.assistDate.toISOString(),
      status: raw.status,
      absenceReason: raw.absenceReason,
    };
  }

  /** Normalizes an ISO or YYYY-MM-DD string to that day's midnight UTC Date. */
  private toDayDate(value: string): Date {
    return new Date(value.slice(0, 10));
  }

  private async ensureEnrollmentExists(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
  ): Promise<void> {
    const enrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id: academicCycleEnrollmentId, academicCycleId },
    });
    if (!enrollment) {
      throw new NotFoundError("Academic cycle enrollment not found");
    }
  }

  async findAllPaged(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    filters: StudentAssistFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<StudentAssistRecord>> {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const where: Record<string, unknown> = { academicCycleEnrollmentId };
    if (filters.fromDate || filters.toDate) {
      const assistDate: Record<string, Date> = {};
      if (filters.fromDate) assistDate.gte = this.toDayDate(filters.fromDate);
      if (filters.toDate) assistDate.lte = this.toDayDate(filters.toDate);
      where.assistDate = assistDate;
    }

    const [data, itemsCount] = await Promise.all([
      this.prisma.studentAssist.findMany({
        where,
        orderBy: { assistDate: "desc" },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.studentAssist.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toRecord(r)),
      totalPages: Math.ceil(itemsCount / pagination.pageSize),
      currentPage: pagination.page,
      itemsCount,
    };
  }

  async create(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    dto: CreateStudentAssistDto,
  ): Promise<StudentAssistRecord> {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const assistDate = this.toDayDate(dto.assistDate);
    const existing = await this.prisma.studentAssist.findUnique({
      where: {
        academicCycleEnrollmentId_assistDate: {
          academicCycleEnrollmentId,
          assistDate,
        },
      },
    });
    if (existing) {
      throw new ConflictError(
        "An attendance record already exists for this enrollment on this day",
      );
    }

    const created = await this.prisma.studentAssist.create({
      data: {
        academicCycleEnrollmentId,
        assistDate,
        status: dto.status,
        absenceReason: dto.absenceReason ?? null,
      },
    });

    return this.toRecord(created);
  }

  private async findOwnedAssist(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    id: string,
  ) {
    await this.ensureEnrollmentExists(academicCycleId, academicCycleEnrollmentId);

    const assist = await this.prisma.studentAssist.findFirst({
      where: { id, academicCycleEnrollmentId },
    });
    if (!assist) throw new NotFoundError("Attendance record not found");
    return assist;
  }

  async update(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    id: string,
    dto: UpdateStudentAssistDto,
  ): Promise<StudentAssistRecord> {
    await this.findOwnedAssist(academicCycleId, academicCycleEnrollmentId, id);

    const updateData: Record<string, unknown> = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.absenceReason !== undefined) updateData.absenceReason = dto.absenceReason;

    const updated = await this.prisma.studentAssist.update({
      where: { id },
      data: updateData,
    });

    return this.toRecord(updated);
  }

  async remove(
    academicCycleId: string,
    academicCycleEnrollmentId: string,
    id: string,
  ): Promise<void> {
    await this.findOwnedAssist(academicCycleId, academicCycleEnrollmentId, id);
    await this.prisma.studentAssist.delete({ where: { id } });
  }
}
