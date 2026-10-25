import { Request, Response } from "express";
import { AcademicCycleSchoolSubjectService } from "./academic-cycle-school-subject.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";

const service = new AcademicCycleSchoolSubjectService(prisma);

/** GET /academic-cycles/:academicCycleId/school-subjects */
export async function findAllSchoolSubjects(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.findAll(academicCycleId);
  sendSuccess(res, data);
}

/** POST /academic-cycles/:academicCycleId/school-subjects */
export async function createSchoolSubject(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.create(academicCycleId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /academic-cycles/:academicCycleId/school-subjects/:id */
export async function updateSchoolSubject(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  const data = await service.update(academicCycleId, id, req.body);
  sendSuccess(res, data);
}

/** DELETE /academic-cycles/:academicCycleId/school-subjects/:id */
export async function deleteSchoolSubject(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  await service.remove(academicCycleId, id);
  sendNoContent(res);
}
