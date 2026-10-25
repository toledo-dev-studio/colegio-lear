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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Applies a scholarship's discount percentage (e.g. 30 = 30% off) to an amount. */
function applyDiscount(amount: number, discountPercentage: number): number {
  if (!discountPercentage) return round2(amount);
  return round2(amount * (1 - discountPercentage / 100));
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
    if (!cycle) throw new NotFoundError("Ciclo escolar no encontrado");
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

  /**
   * GET every enrollment in a group (optionally filtered by status), no
   * pagination — used by "my classes" to populate its student roster for
   * chats/grades. Always scoped to a group (see schema: required there).
   */
  async findAllByGroup(
    academicCycleId: string,
    filters: AcademicCycleEnrollmentFilters,
  ): Promise<AcademicCycleEnrollmentRecord[]> {
    await this.ensureCycleExists(academicCycleId);
    const where = this.buildWhereClause(academicCycleId, filters);

    const results = await this.prisma.academicCycleEnrollment.findMany({
      where,
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toRecord(r));
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
    if (!record) throw new NotFoundError("Inscripción al ciclo escolar no encontrada");

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
        "Las inscripciones están cerradas para este ciclo escolar",
      );
    }

    const group = await this.prisma.academicCycleGroup.findFirst({
      where: { id: dto.academicCycleSchoolGroupId, academicCycleId },
    });
    if (!group) {
      throw new NotFoundError(
        "Grupo no encontrado en este ciclo escolar",
      );
    }

    // Block re-enrolling a student already in this cycle, regardless of
    // their existing enrollment's status (enrolled/completed/dropped).
    const existingEnrollment = await this.prisma.academicCycleEnrollment.findFirst({
      where: { studentId: dto.studentId, academicCycleId },
    });
    if (existingEnrollment) {
      throw new ConflictError(
        "Este alumno ya está inscrito en este ciclo escolar",
      );
    }

    const code = await this.generateCode();

    // Only snapshot the wallet catalog for enrollments created after the
    // cycle's first activation — before that (alreadyActivated: false), the
    // catalog isn't locked in yet, so enrolling early must not copy a
    // possibly-incomplete configuration. Once activated, new enrollments
    // (added while the cycle is still "active") get the current catalog
    // immediately, same as before.
    const shouldSnapshotWallet = cycle.alreadyActivated && cycle.status === "active";

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
      // (forgiveness/extension) and pays against them. If the enrollment
      // has a scholarship, its discount applies to every item's amount
      // right away — a scholarship isn't a payment, it lowers what's
      // actually owed.
      if (shouldSnapshotWallet) {
        const [walletCatalog, scholarship] = await Promise.all([
          tx.academicCycleWallet.findMany({ where: { academicCycleId } }),
          dto.scholarshipId
            ? tx.scholarship.findUnique({
                where: { id: dto.scholarshipId },
                select: { discountPercentage: true },
              })
            : Promise.resolve(null),
        ]);
        const discountPercentage = Number(scholarship?.discountPercentage ?? 0);

        if (walletCatalog.length > 0) {
          await tx.studentWalletItem.createMany({
            data: walletCatalog.map((w) => {
              const amount = applyDiscount(Number(w.amount), discountPercentage);
              return {
                name: w.name,
                code: w.code,
                description: w.description,
                amount,
                allowForgiveness: w.allowForgiveness,
                outstandingAmount: amount,
                dueDate: w.dueDate,
                studentId: dto.studentId,
                academicCycleId,
                academicCycleEnrollmentId: enrollment.id,
                academicCycleWalletId: w.id,
              };
            }),
          });
        }
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
      throw new NotFoundError("Inscripción al ciclo escolar no encontrada");
    }

    if (dto.academicCycleSchoolGroupId !== undefined) {
      const group = await this.prisma.academicCycleGroup.findFirst({
        where: { id: dto.academicCycleSchoolGroupId, academicCycleId },
      });
      if (!group) {
        throw new NotFoundError(
          "Grupo no encontrado en este ciclo escolar",
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
      throw new NotFoundError("Inscripción al ciclo escolar no encontrada");
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
      throw new NotFoundError("Alumno no encontrado");
    }

    const results = await this.prisma.academicCycleEnrollment.findMany({
      where: { studentId },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toRecord(r));
  }
}
