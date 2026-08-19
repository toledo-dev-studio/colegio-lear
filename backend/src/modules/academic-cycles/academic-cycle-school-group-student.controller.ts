import { Request, Response, NextFunction } from "express";
import { AcademicCycleSchoolGroupService } from "./academic-cycle-school-group.service";
import { academicCycleSchoolGroupIdParamSchema } from "./academic-cycle-school-group.schema";
import { prisma } from "../../shared/lib/prisma";
import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handlers for the "shared URL" school-group endpoints
 * (/academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/{calendars,teachers}).
 * Each export below is the SOLE Express handler for its route (see
 * gate-student-session.middleware.ts for why chaining more middleware after
 * the gate would break the fallthrough to the employee router) — it does
 * the gate check, param validation, ownership check, and response all
 * inline, then delegates the actual data-shaping to
 * AcademicCycleSchoolGroupService, the same service the employee-facing
 * controller uses — no duplicated mapping logic.
 */

const service = new AcademicCycleSchoolGroupService(prisma);

function parseParams(req: Request): {
  academicCycleId: string;
  academicCycleSchoolGroupId: string;
} {
  const result = academicCycleSchoolGroupIdParamSchema.safeParse(req.params);
  if (!result.success) {
    throw new ValidationError(
      "Validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

/**
 * Verifies the requesting student actually has an enrollment in this exact
 * academic cycle + school group before letting the real query run. 404
 * (not 403) on mismatch, so this never confirms the group's existence to a
 * student who isn't enrolled in it — same posture as SERVICIOS_PORTAL_ALUMNO.md's
 * "nota de acceso" for grades/wallet.
 */
async function assertStudentOwnsSchoolGroup(
  studentId: string,
  academicCycleId: string,
  academicCycleSchoolGroupId: string,
): Promise<void> {
  const enrollment = await prisma.academicCycleEnrollment.findFirst({
    where: { studentId, academicCycleId, academicCycleSchoolGroupId },
    select: { id: true },
  });

  if (!enrollment) {
    throw new NotFoundError("Academic cycle school group not found");
  }
}

/** GET /academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/calendars */
export async function findAllCalendars(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { academicCycleId, academicCycleSchoolGroupId } = parseParams(req);
  await assertStudentOwnsSchoolGroup(
    req.student!.studentId,
    academicCycleId,
    academicCycleSchoolGroupId,
  );

  const data = await service.findAllCalendars(
    academicCycleId,
    academicCycleSchoolGroupId,
  );
  sendSuccess(res, data);
}

/** GET /academic-cycles/:academicCycleId/school-groups/:academicCycleSchoolGroupId/teachers */
export async function findAllTeachers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { academicCycleId, academicCycleSchoolGroupId } = parseParams(req);
  await assertStudentOwnsSchoolGroup(
    req.student!.studentId,
    academicCycleId,
    academicCycleSchoolGroupId,
  );

  // Student portal always sees active teachers only — no includeInactive
  // knob exposed to it (that's an admin-only concern).
  const data = await service.findAllTeachers(
    academicCycleId,
    academicCycleSchoolGroupId,
    false,
  );
  sendSuccess(res, data);
}
