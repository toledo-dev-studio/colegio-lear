import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  AcademicCycleSchoolSubjectRecord,
  CreateAcademicCycleSchoolSubjectDto,
  UpdateAcademicCycleSchoolSubjectDto,
} from "./academic-cycle-school-subject.types";

// ─── Include clause for related entities ────────────────────────────────────

const INCLUDE_RELATIONS = {
  schoolSubject: { select: { id: true, name: true, description: true } },
};

/**
 * Business logic layer for the Academic Cycle School Subjects sub-resource.
 */
export class AcademicCycleSchoolSubjectService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Verifies the parent academic cycle exists */
  private async ensureCycleExists(academicCycleId: string): Promise<void> {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: academicCycleId },
      select: { id: true },
    });
    if (!cycle) throw new NotFoundError("Academic cycle not found");
  }

  private toRecord(
    raw: Record<string, unknown>,
  ): AcademicCycleSchoolSubjectRecord {
    return {
      id: raw.id as string,
      academicCycleId: raw.academicCycleId as string,
      schoolSubjectId: raw.schoolSubjectId as string,
      observations: raw.observations as string | null,
      schoolSubject: raw.schoolSubject as {
        id: string;
        name: string;
        description: string | null;
      },
    };
  }

  /** GET all school subjects for an academic cycle */
  async findAll(
    academicCycleId: string,
  ): Promise<AcademicCycleSchoolSubjectRecord[]> {
    await this.ensureCycleExists(academicCycleId);

    const results = await this.prisma.academicCycleSchoolSubject.findMany({
      where: { academicCycleId },
      include: INCLUDE_RELATIONS,
    });

    return results.map((r) =>
      this.toRecord(r as unknown as Record<string, unknown>),
    );
  }

  /** POST create a new school subject association */
  async create(
    academicCycleId: string,
    dto: CreateAcademicCycleSchoolSubjectDto,
  ): Promise<AcademicCycleSchoolSubjectRecord> {
    await this.ensureCycleExists(academicCycleId);

    // Check uniqueness: same subject can't be added twice to the same cycle
    const existing = await this.prisma.academicCycleSchoolSubject.findUnique({
      where: {
        academicCycleId_schoolSubjectId: {
          academicCycleId,
          schoolSubjectId: dto.schoolSubjectId,
        },
      },
    });
    if (existing) {
      throw new ConflictError(
        "This school subject is already assigned to this academic cycle",
      );
    }

    const created = await this.prisma.academicCycleSchoolSubject.create({
      data: {
        academicCycleId,
        schoolSubjectId: dto.schoolSubjectId,
        observations: dto.observations ?? null,
      },
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(created as unknown as Record<string, unknown>);
  }

  /** PATCH update a school subject association */
  async update(
    academicCycleId: string,
    id: string,
    dto: UpdateAcademicCycleSchoolSubjectDto,
  ): Promise<AcademicCycleSchoolSubjectRecord> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleSchoolSubject.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Academic cycle school subject not found");
    }

    // If changing schoolSubjectId, check uniqueness
    if (
      dto.schoolSubjectId !== undefined &&
      dto.schoolSubjectId !== existing.schoolSubjectId
    ) {
      const dup = await this.prisma.academicCycleSchoolSubject.findUnique({
        where: {
          academicCycleId_schoolSubjectId: {
            academicCycleId,
            schoolSubjectId: dto.schoolSubjectId,
          },
        },
      });
      if (dup) {
        throw new ConflictError(
          "This school subject is already assigned to this academic cycle",
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.schoolSubjectId !== undefined)
      updateData.schoolSubjectId = dto.schoolSubjectId;
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;

    const updated = await this.prisma.academicCycleSchoolSubject.update({
      where: { id },
      data: updateData,
      include: INCLUDE_RELATIONS,
    });

    return this.toRecord(updated as unknown as Record<string, unknown>);
  }

  /** DELETE hard delete a school subject association */
  async remove(academicCycleId: string, id: string): Promise<void> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleSchoolSubject.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Academic cycle school subject not found");
    }

    await this.prisma.academicCycleSchoolSubject.delete({ where: { id } });
  }
}
