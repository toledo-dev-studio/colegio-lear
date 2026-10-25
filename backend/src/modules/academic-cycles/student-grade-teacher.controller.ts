import { Request, Response } from "express";
import { StudentGradeService } from "./student-grade.service";
import { resolveTeacherSubjectScope } from "./teacher-class-scope.helper";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess, sendNoContent } from "../../shared/helpers/response.helper";

const service = new StudentGradeService(prisma);

function scopeParams(req: Request) {
  const { schoolGroupId, schoolSubjectId } = req.params as {
    schoolGroupId: string;
    schoolSubjectId: string;
  };
  return { schoolGroupId, schoolSubjectId };
}

/** GET /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades */
export async function findAll(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { employeeId } = req.user!;

  await resolveTeacherSubjectScope(prisma, employeeId, schoolGroupId, schoolSubjectId);

  const data = await service.findAllByGroupAndSubject(schoolGroupId, schoolSubjectId);
  sendSuccess(res, data);
}

/** PUT /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades */
export async function upsert(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { employeeId } = req.user!;
  const { academicCycleEnrollmentId, evaluationNumber, grade } = req.body as {
    academicCycleEnrollmentId: string;
    evaluationNumber: number;
    grade: number;
  };

  await resolveTeacherSubjectScope(prisma, employeeId, schoolGroupId, schoolSubjectId);

  const data = await service.upsert(schoolGroupId, schoolSubjectId, {
    academicCycleEnrollmentId,
    evaluationNumber,
    grade,
  });
  sendSuccess(res, data);
}

/** DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/grades/:gradeId */
export async function remove(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { gradeId } = req.params as { gradeId: string };
  const { employeeId } = req.user!;

  await resolveTeacherSubjectScope(prisma, employeeId, schoolGroupId, schoolSubjectId);

  await service.remove(schoolGroupId, gradeId);
  sendNoContent(res);
}
