import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  AcademicCycleEnrollmentFilters,
  AcademicCycleEnrollmentRecord,
  PagedResult,
  CreateAcademicCycleEnrollmentDto,
  UpdateAcademicCycleEnrollmentDto,
} from "./academic-cycle-enrollment.types";

interface PaginationParams {
  page: number;
  pageSize: number;
}

const STUDENT_SELECT = {
  id: true,
  name: true,
  firstLastName: true,
  secondLastName: true,
  enrollment: true,
};

const INCLUDE_RELATIONS = {
  student: { select: STUDENT_SELECT },
  academicCycle: { select: { id: true, name: true, status: true } },
  academicCycleSchoolGroup: { select: { id: true, name: true } },
  scholarship: {
    select: { id: true, name: true, discountPercentage: true },
  },
};

/**
 * Business logic layer for the Academic Cycle Enrollments sub-resource.
 */
export class AcademicCycleEnrollmentService {
  constructor(private readonly prisma: PrismaClient) {}

  private async ensureCycleExists(academicCycleId: string) {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: academicCycleId },
    });
    if (!cycle) throw new NotFoundError("Academic cycle not found");
    return cycle;
  }

  private buildWhereClause(
    academicCycleId: string,
    filters: AcademicCycleEnrollmentFilters,
  ) {
    const where: Record<string, unknown> = { academicCycleId };
    const andConditions: unknown[] = [];

    if (filters.q) {
      andConditions.push({
        OR: [
          { code: { contains: filters.q, mode: "insensitive" } },
          { student: { name: { contains: filters.q, mode: "insensitive" } } },
          {
            student: {
              firstLastName: { contains: filters.q, mode: "insensitive" },
            },
          },
          { student: { enrollment: { contains: filters.q, mode: "insensitive" } } },
        ],
      });
    }

    if (filters.status) {
      andConditions.push({ status: filters.status as never });
    }

    if (filters.academicCycleSchoolGroupId) {
      andConditions.push({
        academicCycleSchoolGroupId: filters.academicCycleSchoolGroupId,
      });
    }

    if (filters.scholarshipId) {
      andConditions.push({ scholarshipId: filters.scholarshipId });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toRecord(raw: any): AcademicCycleEnrollmentRecord {
    return {
      id: raw.id,
      code: raw.code,
      status: raw.status,
      observations: raw.observations,
      droppedNotes: raw.droppedNotes,
      studentId: raw.studentId,
      student: raw.student,
      academicCycleId: raw.academicCycleId,
      academicCycle: raw.academicCycle,
      academicCycleSchoolGroupId: raw.academicCycleSchoolGroupId,
      academicCycleSchoolGroup: raw.academicCycleSchoolGroup,
      scholarshipId: raw.scholarshipId,
      scholarship: raw.scholarship,
      createdAt: raw.createdAt.toISOString(),
    };
  }

  /** Generate a code like INS-2026-0001 */
  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INS-${year}-`;

    const last = await this.prisma.academicCycleEnrollment.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: "desc" },
      select: { code: true },
    });

    let nextNumber = 1;
    if (last) {
      const lastNumber = parseInt(last.code.slice(prefix.length), 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
  }

  /** GET paginated enrollments for an academic cycle */
  async findAllPaged(
    academicCycleId: string,
    filters: AcademicCycleEnrollmentFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<AcademicCycleEnrollmentRecord>> {
    await this.ensureCycleExists(academicCycleId);
    const where = this.buildWhereClause(academicCycleId, filters);

    const [data, itemsCount] = await Promise.all([
      this.prisma.academicCycleEnrollment.findMany({
        where,
        include: INCLUDE_RELATIONS,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.academicCycleEnrollment.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toRecord(r)),
      totalPages: Math.ceil(itemsCount / pagination.pageSize),
      currentPage: pagination.page,
      itemsCount,
    };
  }

  /** GET a single enrollment by ID */
  async findById(
    academicCycleId: string,
    id: string,
  ): Promise<AcademicCycleEnrollmentRecord> {
    await this.ensureCycleExists(academicCycleId);

    const record = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id, academicCycleId },
      include: INCLUDE_RELATIONS,
    });
    if (!record) throw new NotFoundError("Academic cycle enrollment not found");

    return this.toRecord(record);
  }

  /** POST create a new enrollment */
  async create(
    academicCycleId: string,
    dto: CreateAcademicCycleEnrollmentDto,
  ): Promise<AcademicCycleEnrollmentRecord> {
    const cycle = await this.ensureCycleExists(academicCycleId);

    if (
      !cycle.enrollmentOpen ||
      (cycle.status !== "active" && cycle.status !== "upcoming")
    ) {
      throw new ConflictError(
        "Enrollment is closed for this academic cycle",
      );
    }

    const group = await this.prisma.academicCycleGroup.findFirst({
      where: { id: dto.academicCycleSchoolGroupId, academicCycleId },
    });
    if (!group) {
      throw new NotFoundError(
        "Academic cycle school group not found in this academic cycle",
      );
    }

    // Block re-enrolling a student already in this cycle, regardless of
    // their existing enrollment's status (enrolled/completed/dropped).
    const existingEnrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { studentId: dto.studentId, academicCycleId },
    });
    if (existingEnrollment) {
      throw new ConflictError(
        "This student is already enrolled in this academic cycle",
      );
    }

    const code = await this.generateCode();

    const created = await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.academicCycleEnrollment.create({
        data: {
          code,
          status: dto.status ?? "enrolled",
          observations: dto.observations ?? null,
          droppedNotes: dto.droppedNotes ?? null,
          studentId: dto.studentId,
          academicCycleId,
          academicCycleSchoolGroupId: dto.academicCycleSchoolGroupId,
          scholarshipId: dto.scholarshipId ?? null,
        },
        include: INCLUDE_RELATIONS,
      });

      // Snapshot the cycle's wallet catalog into the student's own wallet
      // items — the front never creates these directly, only edits
      // (forgiveness/extension) and pays against them.
      const walletCatalog = await tx.academicCycleWallet.findMany({
        where: { academicCycleId },
      });

      if (walletCatalog.length > 0) {
        await tx.studentWalletItem.createMany({
          data: walletCatalog.map((w) => ({
            name: w.name,
            code: w.code,
            description: w.description,
            amount: w.amount,
            allowForgiveness: w.allowForgiveness,
            outstandingAmount: w.amount,
            dueDate: w.dueDate,
            studentId: dto.studentId,
            academicCycleId,
            academicCycleEnrollmentId: enrollment.id,
            academicCycleWalletId: w.id,
          })),
        });
      }

      return enrollment;
    });

    return this.toRecord(created);
  }

  /** PATCH update an enrollment */
  async update(
    academicCycleId: string,
    id: string,
    dto: UpdateAcademicCycleEnrollmentDto,
  ): Promise<AcademicCycleEnrollmentRecord> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Academic cycle enrollment not found");
    }

    if (dto.academicCycleSchoolGroupId !== undefined) {
      const group = await this.prisma.academicCycleGroup.findFirst({
        where: { id: dto.academicCycleSchoolGroupId, academicCycleId },
      });
      if (!group) {
        throw new NotFoundError(
          "Academic cycle school group not found in this academic cycle",
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.observations !== undefined) updateData.observations = dto.observations;
    if (dto.droppedNotes !== undefined) updateData.droppedNotes = dto.droppedNotes;
    if (dto.academicCycleSchoolGroupId !== undefined)
      updateData.academicCycleSchoolGroupId = dto.academicCycleSchoolGroupId;
    if (dto.scholarshipId !== undefined)
      updateData.scholarshipId = dto.scholarshipId;

    const updated = await this.prisma.academicCycleEnrollment.update({
      where: { id },
      data: updateData,
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(updated);
  }

  /** DELETE hard delete an enrollment */
  async remove(academicCycleId: string, id: string): Promise<void> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleEnrollment.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Academic cycle enrollment not found");
    }

    await this.prisma.academicCycleEnrollment.delete({ where: { id } });
  }

  /** GET all enrollments for a student across every academic cycle */
  async findAllByStudentId(
    studentId: string,
  ): Promise<AcademicCycleEnrollmentRecord[]> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || student.isDeleted) {
      throw new NotFoundError("Student not found");
    }

    const results = await this.prisma.academicCycleEnrollment.findMany({
      where: { studentId },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toRecord(r));
  }
}
