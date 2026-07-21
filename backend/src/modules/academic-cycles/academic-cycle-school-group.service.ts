import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
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

// ─── Include clause for calendar entries (with nested subject + teacher) ────

const CALENDAR_INCLUDE = {
  schoolSubject: { select: { id: true, name: true, description: true } },
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
    if (!cycle) throw new NotFoundError("Academic cycle not found");
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
      schoolSubjectId: raw.schoolSubjectId,
      schoolSubject: raw.schoolSubject,
      teacherId: raw.teacherId,
      teacher: {
        ...raw.teacher,
        jobTitle: {
          ...raw.teacher.jobTitle,
          jobTitleType: toFrontendJobTitleType(raw.teacher.jobTitle.jobTitleType),
        },
      },
    };
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

    if (!record) throw new NotFoundError("Academic cycle school group not found");

    return this.toRecord(record);
  }

  /** POST create a new school group (+ optional initial calendars) */
  async create(
    academicCycleId: string,
    dto: CreateAcademicCycleSchoolGroupDto,
  ): Promise<AcademicCycleSchoolGroupRecord> {
    await this.ensureCycleExists(academicCycleId);

    const created = await this.prisma.academicCycleGroup.create({
      data: {
        academicCycleId,
        name: dto.name,
        status: dto.status ?? "active",
        description: dto.description ?? null,
        dischargedDescription: dto.dischargedDescription ?? null,
        ...(dto.calendars && dto.calendars.length > 0
          ? {
              calendars: {
                create: dto.calendars.map((c) =>
                  this.toCalendarCreateData(academicCycleId, c),
                ),
              },
            }
          : {}),
      },
      include: { calendars: { include: CALENDAR_INCLUDE } },
    });

    return this.toRecord(created);
  }

  private toCalendarCreateData(
    academicCycleId: string,
    c: AcademicCycleSchoolGroupCalendarInput,
  ) {
    return {
      academicCycleId,
      day: c.day,
      startTime: stringToTime(c.startTime),
      endTime: stringToTime(c.endTime),
      schoolSubjectId: c.schoolSubjectId,
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
      throw new NotFoundError("Academic cycle school group not found");
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
              ...this.toCalendarCreateData(academicCycleId, c),
              academicCycleSchoolGroupId: id,
            },
          });
        }

        const toUpdate = dto.calendars.filter((c) => !isNewCalendarId(c.id));
        for (const c of toUpdate) {
          await tx.academicCycleGroupCalendar.update({
            where: { id: c.id as string },
            data: {
              day: c.day,
              startTime: stringToTime(c.startTime),
              endTime: stringToTime(c.endTime),
              schoolSubjectId: c.schoolSubjectId,
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
      throw new NotFoundError("Academic cycle school group not found");
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
      const key = `${r.schoolSubjectId}:${r.teacherId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const calendarRecord = this.toCalendarRecord(r);
      teachers.push({
        schoolSubjectId: calendarRecord.schoolSubjectId,
        schoolSubject: calendarRecord.schoolSubject,
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
      throw new NotFoundError("Academic cycle school group not found");
    }
  }
}
