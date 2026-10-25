import { PrismaClient, Prisma } from "../../generated/prisma/client";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import { EMPLOYEE_LIST_SELECT } from "../employees/employee.types";
import { toFrontendJobTitleType } from "../job-titles/job-title.service";
import type {
  AcademicCycleSchoolGroupRecord,
  AcademicCycleSchoolGroupCalendarRecord,
  AcademicCycleSchoolGroupTeacherRecord,
  AcademicCycleSchoolGroupCalendarInput,
  CreateAcademicCycleSchoolGroupDto,
  UpdateAcademicCycleSchoolGroupDto,
} from "./academic-cycle-school-group.types";

/**
 * Calendar entries reference the cycle's own subject catalog entry
 * (academicCycleSchoolSubject), not the global SchoolSubject catalog
 * directly — a class can only be scheduled for a subject that was actually
 * added to that specific academic cycle first. The public API shape is
 * unaffected: requests/responses still use `schoolSubjectId` (the global
 * catalog id); this indirection is resolved internally.
 */
const CALENDAR_INCLUDE = {
  academicCycleSchoolSubject: {
    select: {
      schoolSubjectId: true,
      schoolSubject: { select: { id: true, name: true, description: true } },
    },
  },
  teacher: { select: EMPLOYEE_LIST_SELECT },
};

/** Calendar entries sent with a "new_" (or "new-") temporal id are creates */
function isNewCalendarId(id: string | undefined): boolean {
  return !id || id.startsWith("new_") || id.startsWith("new-");
}

function timeToString(value: Date): string {
  return value.toISOString().slice(11, 16);
}

function stringToTime(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

/**
 * Business logic layer for the Academic Cycle School Groups sub-resource
 * (+ its nested calendars and derived teachers view).
 */
export class AcademicCycleSchoolGroupService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Verifies the parent academic cycle exists */
  private async ensureCycleExists(academicCycleId: string): Promise<void> {
    const cycle = await this.prisma.academicCycle.findUnique({
      where: { id: academicCycleId },
      select: { id: true },
    });
    if (!cycle) throw new NotFoundError("Ciclo escolar no encontrado");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toCalendarRecord(raw: any): AcademicCycleSchoolGroupCalendarRecord {
    return {
      id: raw.id,
      day: raw.day,
      startTime: timeToString(raw.startTime),
      endTime: timeToString(raw.endTime),
      academicCycleId: raw.academicCycleId,
      academicCycleSchoolGroupId: raw.academicCycleSchoolGroupId,
      schoolSubjectId: raw.academicCycleSchoolSubject.schoolSubjectId,
      schoolSubject: raw.academicCycleSchoolSubject.schoolSubject,
      teacherId: raw.teacherId,
      teacher: {
        ...raw.teacher,
        avatar: toPublicFileUrl(raw.teacher.avatar),
        jobTitle: {
          ...raw.teacher.jobTitle,
          jobTitleType: toFrontendJobTitleType(raw.teacher.jobTitle.jobTitleType),
        },
      },
    };
  }

  /**
   * Resolves a (public) schoolSubjectId to this cycle's own subject catalog
   * association id (academic_cycle_school_subjects.id). Throws if the
   * subject was never added to this academic cycle via
   * POST /academic-cycles/{id}/school-subjects — this is the enforcement
   * point that keeps calendar entries from teaching a subject the cycle
   * doesn't actually offer.
   */
  private async resolveAcademicCycleSchoolSubjectId(
    client: PrismaClient | Prisma.TransactionClient,
    academicCycleId: string,
    schoolSubjectId: string,
  ): Promise<string> {
    const association = await client.academicCycleSchoolSubject.findUnique({
      where: {
        academicCycleId_schoolSubjectId: { academicCycleId, schoolSubjectId },
      },
      select: { id: true },
    });

    if (!association) {
      throw new ValidationError(
        "schoolSubjectId no ha sido agregado al catálogo de materias de este ciclo escolar",
        [
          {
            field: "schoolSubjectId",
            message:
              "Agrégalo primero al ciclo escolar mediante POST /academic-cycles/{id}/school-subjects",
          },
        ],
      );
    }

    return association.id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toRecord(raw: any): AcademicCycleSchoolGroupRecord {
    return {
      id: raw.id,
      name: raw.name,
      status: raw.status,
      description: raw.description,
      dischargedDescription: raw.dischargedDescription,
      academicCycleId: raw.academicCycleId,
      calendars: raw.calendars
        ? raw.calendars.map((c: unknown) => this.toCalendarRecord(c))
        : undefined,
    };
  }

  /** GET all school groups for an academic cycle (list view, no calendars) */
  async findAll(
    academicCycleId: string,
  ): Promise<AcademicCycleSchoolGroupRecord[]> {
    await this.ensureCycleExists(academicCycleId);

    const results = await this.prisma.academicCycleGroup.findMany({
      where: { academicCycleId },
      orderBy: { createdAt: "desc" },
    });

    return results.map((r) => this.toRecord(r));
  }

  /** GET a single school group with its calendars */
  async findById(
    academicCycleId: string,
    id: string,
  ): Promise<AcademicCycleSchoolGroupRecord> {
    await this.ensureCycleExists(academicCycleId);

    const record = await this.prisma.academicCycleGroup.findFirst({
      where: { id, academicCycleId },
      include: { calendars: { include: CALENDAR_INCLUDE } },
    });

    if (!record) throw new NotFoundError("Grupo no encontrado en este ciclo escolar");

    return this.toRecord(record);
  }

  /** POST create a new school group (+ optional initial calendars) */
  async create(
    academicCycleId: string,
    dto: CreateAcademicCycleSchoolGroupDto,
  ): Promise<AcademicCycleSchoolGroupRecord> {
    await this.ensureCycleExists(academicCycleId);

    const calendarCreateData =
      dto.calendars && dto.calendars.length > 0
        ? await Promise.all(
            dto.calendars.map((c) =>
              this.toCalendarCreateData(this.prisma, academicCycleId, c),
            ),
          )
        : [];

    const created = await this.prisma.academicCycleGroup.create({
      data: {
        academicCycleId,
        name: dto.name,
        status: dto.status ?? "active",
        description: dto.description ?? null,
        dischargedDescription: dto.dischargedDescription ?? null,
        ...(calendarCreateData.length > 0
          ? { calendars: { create: calendarCreateData } }
          : {}),
      },
      include: { calendars: { include: CALENDAR_INCLUDE } },
    });

    return this.toRecord(created);
  }

  private async toCalendarCreateData(
    client: PrismaClient | Prisma.TransactionClient,
    academicCycleId: string,
    c: AcademicCycleSchoolGroupCalendarInput,
  ) {
    const academicCycleSchoolSubjectId =
      await this.resolveAcademicCycleSchoolSubjectId(
        client,
        academicCycleId,
        c.schoolSubjectId,
      );
    return {
      academicCycleId,
      day: c.day,
      startTime: stringToTime(c.startTime),
      endTime: stringToTime(c.endTime),
      academicCycleSchoolSubjectId,
      teacherId: c.teacherId,
    };
  }

  /** PATCH update a school group, syncing its calendars (new_/new- id = create) */
  async update(
    academicCycleId: string,
    id: string,
    dto: UpdateAcademicCycleSchoolGroupDto,
  ): Promise<AcademicCycleSchoolGroupRecord> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleGroup.findFirst({
      where: { id, academicCycleId },
      include: { calendars: true },
    });
    if (!existing) {
      throw new NotFoundError("Grupo no encontrado en este ciclo escolar");
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.dischargedDescription !== undefined)
      updateData.dischargedDescription = dto.dischargedDescription;

    await this.prisma.$transaction(async (tx) => {
      if (dto.calendars !== undefined) {
        const incomingIds = dto.calendars
          .filter((c) => !isNewCalendarId(c.id))
          .map((c) => c.id as string);

        const toDelete = existing.calendars
          .filter((c) => !incomingIds.includes(c.id))
          .map((c) => c.id);

        if (toDelete.length > 0) {
          await tx.academicCycleGroupCalendar.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        const toCreate = dto.calendars.filter((c) => isNewCalendarId(c.id));
        for (const c of toCreate) {
          await tx.academicCycleGroupCalendar.create({
            data: {
              ...(await this.toCalendarCreateData(tx, academicCycleId, c)),
              academicCycleSchoolGroupId: id,
            },
          });
        }

        const toUpdate = dto.calendars.filter((c) => !isNewCalendarId(c.id));
        for (const c of toUpdate) {
          const academicCycleSchoolSubjectId =
            await this.resolveAcademicCycleSchoolSubjectId(
              tx,
              academicCycleId,
              c.schoolSubjectId,
            );
          await tx.academicCycleGroupCalendar.update({
            where: { id: c.id as string },
            data: {
              day: c.day,
              startTime: stringToTime(c.startTime),
              endTime: stringToTime(c.endTime),
              academicCycleSchoolSubjectId,
              teacherId: c.teacherId,
            },
          });
        }
      }

      if (Object.keys(updateData).length > 0) {
        await tx.academicCycleGroup.update({
          where: { id },
          data: updateData,
        });
      }
    });

    const updated = await this.prisma.academicCycleGroup.findUniqueOrThrow({
      where: { id },
      include: { calendars: { include: CALENDAR_INCLUDE } },
    });

    return this.toRecord(updated);
  }

  /** DELETE hard delete a school group (cascades its calendars) */
  async remove(academicCycleId: string, id: string): Promise<void> {
    await this.ensureCycleExists(academicCycleId);

    const existing = await this.prisma.academicCycleGroup.findFirst({
      where: { id, academicCycleId },
    });
    if (!existing) {
      throw new NotFoundError("Grupo no encontrado en este ciclo escolar");
    }

    await this.prisma.academicCycleGroup.delete({ where: { id } });
  }

  /** GET calendars for a school group */
  async findAllCalendars(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
  ): Promise<AcademicCycleSchoolGroupCalendarRecord[]> {
    await this.ensureGroupExists(academicCycleId, academicCycleSchoolGroupId);

    const results = await this.prisma.academicCycleGroupCalendar.findMany({
      where: { academicCycleId, academicCycleSchoolGroupId },
      include: CALENDAR_INCLUDE,
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return results.map((r) => this.toCalendarRecord(r));
  }

  /**
   * GET distinct subject/teacher pairs derived from a group's calendars.
   * Only active teachers by default — pass includeInactive to see the full history.
   */
  async findAllTeachers(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
    includeInactive = false,
  ): Promise<AcademicCycleSchoolGroupTeacherRecord[]> {
    await this.ensureGroupExists(academicCycleId, academicCycleSchoolGroupId);

    const results = await this.prisma.academicCycleGroupCalendar.findMany({
      where: {
        academicCycleId,
        academicCycleSchoolGroupId,
        ...(includeInactive ? {} : { teacher: { isActive: true } }),
      },
      include: CALENDAR_INCLUDE,
    });

    const seen = new Set<string>();
    const teachers: AcademicCycleSchoolGroupTeacherRecord[] = [];
    for (const r of results) {
      const calendarRecord = this.toCalendarRecord(r);
      const key = `${calendarRecord.schoolSubjectId}:${calendarRecord.teacherId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      teachers.push({
        schoolSubjectId: calendarRecord.schoolSubjectId,
        schoolSubject: calendarRecord.schoolSubject,
        academicCycleSchoolSubjectId: r.academicCycleSchoolSubjectId,
        teacherId: calendarRecord.teacherId,
        teacher: calendarRecord.teacher,
      });
    }

    return teachers;
  }

  private async ensureGroupExists(
    academicCycleId: string,
    academicCycleSchoolGroupId: string,
  ): Promise<void> {
    await this.ensureCycleExists(academicCycleId);
    const group = await this.prisma.academicCycleGroup.findFirst({
      where: { id: academicCycleSchoolGroupId, academicCycleId },
      select: { id: true },
    });
    if (!group) {
      throw new NotFoundError("Grupo no encontrado en este ciclo escolar");
    }
  }
}
