import { Request, Response, NextFunction } from "express";
import { SchoolSubjectMaterialService } from "./school-subject-material.service";
import { schoolSubjectMaterialParentParamsSchema } from "./school-subject-material.schema";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for GET .../school-subjects/:id/materials
 * (SERVICIOS_PORTAL_ALUMNO.md §9.2). Reuses SchoolSubjectMaterialService
 * as-is. This URL DOES collide with the employee CRUD route (same GET
 * .../materials, mounted after this one in index.ts) — a prior version of
 * this file wrongly assumed no collision and used authenticateStudent
 * directly, which meant an employee session could never reach its own
 * route here (authenticateStudent threw "Invalid access token" instead of
 * falling through). Fixed to use gateStudentSession, single handler, same
 * pattern as student-grade-student.controller.ts.
 */

const service = new SchoolSubjectMaterialService(prisma, storageService);

function parseParams(req: Request) {
  const result = schoolSubjectMaterialParentParamsSchema.safeParse(req.params);
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

/** GET /academic-cycles/:id/school-groups/:id/school-subjects/:id/materials */
export async function findAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    parseParams(req);

  await assertStudentOwnsSchoolGroup(
    req.student!.studentId,
    academicCycleId,
    academicCycleSchoolGroupId,
  );

  const data = await service.findAll(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
  );
  sendSuccess(res, data);
}
