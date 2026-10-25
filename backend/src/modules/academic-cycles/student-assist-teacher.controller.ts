import { Request, Response } from "express";
import { StudentAssistService } from "./student-assist.service";
import { resolveTeacherGroupScope } from "./teacher-class-scope.helper";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess } from "../../shared/helpers/response.helper";
import type { AssistStatusKey } from "./student-assist.types";

const service = new StudentAssistService(prisma);

function scopeParams(req: Request) {
  const { academicCycleId, schoolGroupId } = req.params as {
    academicCycleId: string;
    schoolGroupId: string;
  };
  return { academicCycleId, schoolGroupId };
}

/**
 * GET /academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists
 * Attendance is per-day, not per-subject — any teacher with a slot in this
 * group's calendar can view/take attendance for the whole group.
 */
export async function findAllByGroupAndDay(req: Request, res: Response): Promise<void> {
  const { academicCycleId, schoolGroupId } = scopeParams(req);
  const { employeeId } = req.user!;
  const { assistDate } = req.query as { assistDate: string };

  await resolveTeacherGroupScope(prisma, employeeId, academicCycleId, schoolGroupId);

  const data = await service.findAllByGroupAndDay(schoolGroupId, assistDate);
  sendSuccess(res, data);
}

/** POST /academic-cycles/:academicCycleId/school-groups/:schoolGroupId/assists (bulk upsert) */
export async function upsertMany(req: Request, res: Response): Promise<void> {
  const { academicCycleId, schoolGroupId } = scopeParams(req);
  const { employeeId } = req.user!;
  const { assistDate, assists } = req.body as {
    assistDate: string;
    assists: Array<{
      academicCycleEnrollmentId: string;
      status: AssistStatusKey;
      absenceReason?: string | null;
    }>;
  };

  await resolveTeacherGroupScope(prisma, employeeId, academicCycleId, schoolGroupId);

  const data = await service.upsertManyForGroup(schoolGroupId, assistDate, assists);
  sendSuccess(res, data);
}
