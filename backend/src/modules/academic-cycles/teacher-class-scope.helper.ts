import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Resolved scope for a teacher-facing "my classes" request: the plain
 * schoolSubjectId from the URL translated into the cycle's own subject
 * catalog entry (AcademicCycleSchoolSubject), the id the rest of the
 * academic-cycles services (SchoolSubjectTaskService,
 * SchoolSubjectMaterialService, ...) actually key on.
 */
export interface TeacherSubjectScope {
  academicCycleId: string;
  academicCycleSchoolSubjectId: string;
}

/**
 * Verifies the authenticated teacher actually teaches `schoolSubjectId`
 * (plain school subject id) in `schoolGroupId`, per
 * AcademicCycleGroupCalendar.teacherId — the source of truth for "who
 * teaches what, where" in this school. Throws NotFoundError (never
 * ForbiddenError) at every step: a class/subject that doesn't exist and one
 * that exists but isn't this teacher's are indistinguishable to the caller,
 * same posture as every other student/teacher ownership check in this
 * codebase — never confirm existence of a resource that isn't the
 * requester's own.
 */
export async function resolveTeacherSubjectScope(
  prisma: PrismaClient,
  teacherId: string,
  schoolGroupId: string,
  schoolSubjectId: string,
): Promise<TeacherSubjectScope> {
  const group = await prisma.academicCycleGroup.findUnique({
    where: { id: schoolGroupId },
    select: { academicCycleId: true },
  });
  if (!group) {
    throw new NotFoundError("Class not found");
  }

  const academicCycleSchoolSubject = await prisma.academicCycleSchoolSubject.findFirst({
    where: { academicCycleId: group.academicCycleId, schoolSubjectId },
    select: { id: true },
  });
  if (!academicCycleSchoolSubject) {
    throw new NotFoundError("School subject not found in this class");
  }

  const teaches = await prisma.academicCycleGroupCalendar.findFirst({
    where: {
      teacherId,
      academicCycleSchoolGroupId: schoolGroupId,
      academicCycleSchoolSubjectId: academicCycleSchoolSubject.id,
    },
    select: { id: true },
  });
  if (!teaches) {
    throw new NotFoundError("School subject not found in this class");
  }

  return {
    academicCycleId: group.academicCycleId,
    academicCycleSchoolSubjectId: academicCycleSchoolSubject.id,
  };
}

/**
 * Verifies the authenticated teacher teaches at least one subject in
 * `schoolGroupId` (any subject, not a specific one) — used by endpoints that
 * operate on the whole class rather than a single subject, like attendance:
 * whichever teacher has a slot in the group's calendar can take attendance
 * for the entire group, not just their own subject. Also verifies
 * `academicCycleId` (a URL param on this endpoint, unlike /me/school-groups/*
 * which derives it from the group) actually matches the group's own cycle.
 * Throws NotFoundError (never ForbiddenError) — same posture as
 * resolveTeacherSubjectScope above.
 */
export async function resolveTeacherGroupScope(
  prisma: PrismaClient,
  teacherId: string,
  academicCycleId: string,
  schoolGroupId: string,
): Promise<void> {
  const group = await prisma.academicCycleGroup.findFirst({
    where: { id: schoolGroupId, academicCycleId },
    select: { id: true },
  });
  if (!group) {
    throw new NotFoundError("Class not found");
  }

  const teaches = await prisma.academicCycleGroupCalendar.findFirst({
    where: { teacherId, academicCycleSchoolGroupId: schoolGroupId },
    select: { id: true },
  });
  if (!teaches) {
    throw new NotFoundError("Class not found");
  }
}
