import { Request, Response } from "express";
import { StudentGradeService } from "./student-grade.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess } from "../../shared/helpers/response.helper";

const service = new StudentGradeService(prisma);

/** GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/grades */
export async function findAllGrades(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
  };
  const data = await service.findAllByEnrollmentId(
    academicCycleId,
    academicCycleEnrollmentId,
  );
  sendSuccess(res, data);
}
