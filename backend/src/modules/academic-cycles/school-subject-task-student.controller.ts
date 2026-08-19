import { Request, Response } from "express";
import { SchoolSubjectTaskService } from "./school-subject-task.service";
import {
  schoolSubjectTaskParentParamsSchema,
  schoolSubjectTaskPagedQuerySchema,
} from "./school-subject-task.schema";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for GET .../school-subjects/:id/tasks
 * (SERVICIOS_PORTAL_ALUMNO.md §9.1). Reuses SchoolSubjectTaskService as-is —
 * same data-shaping the employee CRUD controller uses — only adding the
 * ownership check and pagination defaults specific to the student contract.
 * Not a "shared URL" with any employee route (this path doesn't exist on
 * the employee side yet), so the route applies authenticateStudent directly
 * as regular chained middleware (see school-subject-task-student.routes.ts)
 * — no gate-student-session fallthrough needed, same as /students/me.
 */

const service = new SchoolSubjectTaskService(prisma, storageService);

function parseParams(req: Request) {
  const result = schoolSubjectTaskParentParamsSchema.safeParse(req.params);
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

function parseQuery(req: Request) {
  const result = schoolSubjectTaskPagedQuerySchema.safeParse(req.query);
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
    throw new NotFoundError("Academic cycle school group not found");
  }
}

/** GET /academic-cycles/:id/school-groups/:id/school-subjects/:id/tasks */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
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
