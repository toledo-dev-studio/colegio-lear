import { Request, Response } from "express";
import { SchoolSubjectMaterialService } from "./school-subject-material.service";
import { schoolSubjectMaterialParentParamsSchema } from "./school-subject-material.schema";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for GET .../school-subjects/:id/materials
 * (SERVICIOS_PORTAL_ALUMNO.md §9.2). Reuses SchoolSubjectMaterialService
 * as-is. No employee-side URL collision, so authenticateStudent is applied
 * as regular chained middleware (see school-subject-material-student.routes.ts).
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
export async function findAll(req: Request, res: Response): Promise<void> {
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
