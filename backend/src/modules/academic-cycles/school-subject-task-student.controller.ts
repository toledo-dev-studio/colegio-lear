import { Request, Response, NextFunction } from "express";
import { SchoolSubjectTaskService } from "./school-subject-task.service";
import {
  schoolSubjectTaskParentParamsSchema,
  schoolSubjectTaskPagedQuerySchema,
} from "./school-subject-task.schema";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for GET .../school-subjects/:id/tasks
 * (SERVICIOS_PORTAL_ALUMNO.md §9.1). Reuses SchoolSubjectTaskService as-is —
 * same data-shaping the employee CRUD controller uses — only adding the
 * ownership check and pagination defaults specific to the student contract.
 * This URL DOES collide with the employee CRUD route (same GET .../tasks,
 * mounted after this one in index.ts) — a prior version of this file
 * wrongly assumed no collision and used authenticateStudent directly, which
 * meant an employee session could never reach its own route here
 * (authenticateStudent threw "Invalid access token" instead of falling
 * through). Fixed to use gateStudentSession, single handler, same pattern
 * as student-grade-student.controller.ts.
 */

const service = new SchoolSubjectTaskService(prisma, storageService);

function parseParams(req: Request) {
  const result = schoolSubjectTaskParentParamsSchema.safeParse(req.params);
  if (!result.success) {
    throw new ValidationError(
      "Error de validación",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

function parseQuery(req: Request) {
  const result = schoolSubjectTaskPagedQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ValidationError(
      "Error de validación",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

/**
 * Verifies the requesting student has an enrollment in this exact academic
 * cycle + school group — same posture as horario/docentes (404 on mismatch).
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
    throw new NotFoundError("Grupo no encontrado en este ciclo escolar");
  }
}

/** GET /academic-cycles/:id/school-groups/:id/school-subjects/:id/tasks */
export async function findAllPaged(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    parseParams(req);
  const { page, pageSize } = parseQuery(req);

  await assertStudentOwnsSchoolGroup(
    req.student!.studentId,
    academicCycleId,
    academicCycleSchoolGroupId,
  );

  const result = await service.findAllPaged(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    { page, pageSize },
  );
  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}
