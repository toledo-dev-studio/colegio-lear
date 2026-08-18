import { Request, Response, NextFunction } from "express";
import { StudentGradeService } from "./student-grade.service";
import { academicCycleEnrollmentIdParamSchema } from "./academic-cycle-enrollment.schema";
import { prisma } from "../../shared/lib/prisma";
import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for the "shared URL" grades endpoint
 * (/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades).
 * Sole Express handler for its route (see gate-student-session.middleware.ts
 * for why chaining more middleware after the gate would break the
 * fallthrough to the employee router) — does the gate check, param
 * validation, ownership check, and response all inline, then delegates the
 * actual data-shaping to StudentGradeService, the same service the
 * employee-facing controller uses.
 */

const service = new StudentGradeService(prisma);

function parseParams(req: Request): {
  academicCycleId: string;
  academicCycleEnrollmentId: string;
} {
  const result = academicCycleEnrollmentIdParamSchema.safeParse(req.params);
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
 * Verifies the requesting student actually owns this enrollment before
 * letting the real query run. 404 (not 403) on mismatch — see
 * SERVICIOS_PORTAL_ALUMNO.md §6's "nota de acceso".
 */
async function assertStudentOwnsEnrollment(
  studentId: string,
  academicCycleId: string,
  academicCycleEnrollmentId: string,
): Promise<void> {
  const enrollment = await prisma.academicCycleEnrollment.findFirst({
    where: { id: academicCycleEnrollmentId, academicCycleId, studentId },
    select: { id: true },
  });

  if (!enrollment) {
    throw new NotFoundError("Academic cycle enrollment not found");
  }
}

/** GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades */
export async function findAllGrades(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { academicCycleId, academicCycleEnrollmentId } = parseParams(req);
  await assertStudentOwnsEnrollment(
    req.student!.studentId,
    academicCycleId,
    academicCycleEnrollmentId,
  );

  const data = await service.findAllByEnrollmentId(
    academicCycleId,
    academicCycleEnrollmentId,
  );
  sendSuccess(res, data);
}
