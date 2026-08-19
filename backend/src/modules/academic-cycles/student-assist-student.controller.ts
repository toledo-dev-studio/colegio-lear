import { Request, Response, NextFunction } from "express";
import { StudentAssistService } from "./student-assist.service";
import {
  academicCycleEnrollmentIdParamSchema,
} from "./academic-cycle-enrollment.schema";
import { studentAssistPagedQuerySchema } from "./student-assist.schema";
import { prisma } from "../../shared/lib/prisma";
import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for the "shared URL" attendance endpoint
 * (/academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists).
 * Sole Express handler for its route (see gate-student-session.middleware.ts
 * for why chaining more middleware after the gate would break the
 * fallthrough to the employee router) — does the gate check, param/query
 * validation, ownership check, and response all inline, then delegates the
 * actual data-shaping to StudentAssistService, the same service the
 * employee-facing controller uses.
 */

const service = new StudentAssistService(prisma);

function parseParams(req: Request) {
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

function parseQuery(req: Request) {
  const result = studentAssistPagedQuerySchema.safeParse(req.query);
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

/** GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists */
export async function findAllPaged(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { academicCycleId, academicCycleEnrollmentId } = parseParams(req);
  const { page, pageSize, fromDate, toDate } = parseQuery(req);

  await assertStudentOwnsEnrollment(
    req.student!.studentId,
    academicCycleId,
    academicCycleEnrollmentId,
  );

  const filters: { fromDate?: string; toDate?: string } = {};
  if (fromDate !== undefined) filters.fromDate = fromDate;
  if (toDate !== undefined) filters.toDate = toDate;

  const result = await service.findAllPaged(
    academicCycleId,
    academicCycleEnrollmentId,
    filters,
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
