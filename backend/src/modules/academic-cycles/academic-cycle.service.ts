import { PrismaClient, Prisma } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import { logger } from "../../shared/lib/logger";
import { env } from "../../shared/config/env.config";
import type { IMailService } from "../../shared/services/mail.service";
import { processNotificationEmail } from "../../shared/templates/email.templates";
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
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mail: IMailService,
  ) {}

  private buildWhereClause(filters: AcademicCycleFilters) {
    const where: Record<string, unknown> = {};
    const andConditions: unknown[] = [];

    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { code: { contains: filters.q, mode: "insensitive" } },
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
      alreadyActivated: raw.alreadyActivated as boolean,
      minimumPassingGrade: raw.minimumPassingGrade as number,
      evaluationCount: raw.evaluationCount as number,
      enrollmentOpen: raw.enrollmentOpen as boolean,
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
    actorEmployeeId?: string,
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
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;
    if (dto.academicLevelId !== undefined)
      updateData.academicLevelId = dto.academicLevelId;
    if (dto.educationLevelId !== undefined)
      updateData.educationLevelId = dto.educationLevelId;

    // Activating the cycle (status -> active) for the very first time locks
    // in the wallet catalog: the frontend tells the coordinator this is the
    // point where "el sistema generará automáticamente la configuración
    // correspondiente para los alumnos inscritos". Snapshot
    // AcademicCycleWallet -> StudentWalletItem for every already-enrolled
    // student. Gated on alreadyActivated (not just the previous status) so
    // this bulk copy runs exactly once, ever, even if the cycle later moves
    // through completed/cancelled and somehow back to active.
    const isActivatingForTheFirstTime =
      dto.status === "active" && !existing.alreadyActivated;

    if (isActivatingForTheFirstTime) {
      updateData.alreadyActivated = true;
    }

    const updated = await this.prisma.academicCycle.update({
      where: { id },
      data: updateData,
      include: INCLUDE_RELATIONS,
    });

    // Fire-and-forget: never blocks the response.
    if (isActivatingForTheFirstTime && actorEmployeeId) {
      void this.processWalletActivation(id, updated.name, actorEmployeeId);
    }

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  /**
   * Runs the wallet-catalog snapshot for a just-activated cycle in the
   * background, bracketed by "started"/"completed" (or "error")
   * notifications — always, regardless of enrollment count (5, 100, 1000),
   * so there's always confirmation that the process ran. Only the
   * coordinator who activated the cycle (actorEmployeeId) is notified —
   * never the enrolled students; mass fan-out to selected users/roles is an
   * announcements-only concept. Never awaited by the caller.
   */
  private async processWalletActivation(
    academicCycleId: string,
    cycleName: string,
    actorEmployeeId: string,
  ): Promise<void> {
    const enrollmentCount = await this.prisma.academicCycleEnrollment.count({
      where: { academicCycleId, status: "enrolled" },
    });
    if (enrollmentCount === 0) return;

    await this.createProcessNotification(actorEmployeeId, academicCycleId, {
      title: "Copia de cartera de pago en proceso",
      message: `Se está generando la cartera de pago de los alumnos inscritos en el ciclo escolar "${cycleName}". `,
      type: "info",
    });

    try {
      await this.prisma.$transaction((tx) =>
        this.generateWalletItemsForActivatedCycle(tx, academicCycleId),
      );

      await this.createProcessNotification(actorEmployeeId, academicCycleId, {
        title: "Copia de cartera de pago completada",
        message: "Se terminó exitosamente el registro de la cartera de pagos.",
        type: "info",
      });
    } catch (error) {
      logger.error("Failed to generate wallet items on academic cycle activation", {
        academicCycleId,
        error,
      });

      // Compensating action, not a user request — revert the activation so
      // the coordinator can fix whatever failed and try again.
      await this.prisma.academicCycle.update({
        where: { id: academicCycleId },
        data: { status: "upcoming" as never, alreadyActivated: false },
      });

      await this.createProcessNotification(actorEmployeeId, academicCycleId, {
        title: "Copia de cartera de pago fallida",
        message: `Ocurrió un error al copiar la cartera de pagos para "${cycleName}". El ciclo regresó a "próximo" para que puedas corregir y volver a intentarlo.`,
        type: "error",
      });
    }
  }

  /**
   * Creates the in-app notification (the one guarantee this flow makes —
   * it must always land in the bell). Only "error" notifications also
   * send an email, best-effort — "info" ones (started/completed) are
   * in-app only, they're too frequent/low-stakes to warrant an inbox
   * hit. A failed email is logged but never blocks or rolls back the
   * in-app notification.
   */
  private async createProcessNotification(
    employeeId: string,
    relatedRecordId: string,
    params: { title: string; message: string; type: "info" | "error" },
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        employeeId,
        title: params.title,
        message: params.message,
        type: params.type,
        relatedRecordId,
      },
    });

    if (params.type !== "error") return;

    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
        select: { name: true, email: true },
      });
      if (employee) {
        await this.mail.sendMail({
          to: employee.email,
          subject: params.title,
          html: processNotificationEmail({
            employeeName: employee.name,
            title: params.title,
            message: params.message,
            frontendUrl: env.FRONTEND_URL,
            isError: true,
          }),
        });
      }
    } catch (error) {
      logger.error("Failed to send process notification email", {
        employeeId,
        relatedRecordId,
        error,
      });
    }
  }

  /**
   * Snapshots the cycle's wallet catalog (AcademicCycleWallet) into a
   * StudentWalletItem for every enrolled student that doesn't already have
   * one for a given catalog item — covers both students enrolled before the
   * catalog was finished, and catalog items added after some enrollments.
   */
  private async generateWalletItemsForActivatedCycle(
    tx: Prisma.TransactionClient,
    academicCycleId: string,
  ): Promise<void> {
    const [walletCatalog, enrollments, existingItems] = await Promise.all([
      tx.academicCycleWallet.findMany({ where: { academicCycleId } }),
      tx.academicCycleEnrollment.findMany({
        where: { academicCycleId, status: "enrolled" },
        select: { id: true, studentId: true },
      }),
      tx.studentWalletItem.findMany({
        where: { academicCycleId },
        select: { academicCycleEnrollmentId: true, academicCycleWalletId: true },
      }),
    ]);

    if (walletCatalog.length === 0 || enrollments.length === 0) return;

    const existingKeys = new Set(
      existingItems.map(
        (i) => `${i.academicCycleEnrollmentId}:${i.academicCycleWalletId}`,
      ),
    );

    const toCreate = enrollments.flatMap((enrollment) =>
      walletCatalog
        .filter((w) => !existingKeys.has(`${enrollment.id}:${w.id}`))
        .map((w) => ({
          name: w.name,
          code: w.code,
          description: w.description,
          amount: w.amount,
          allowForgiveness: w.allowForgiveness,
          outstandingAmount: w.amount,
          dueDate: w.dueDate,
          studentId: enrollment.studentId,
          academicCycleId,
          academicCycleEnrollmentId: enrollment.id,
          academicCycleWalletId: w.id,
        })),
    );

    if (toCreate.length > 0) {
      await tx.studentWalletItem.createMany({ data: toCreate });
    }
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
