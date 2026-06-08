import { Request, Response } from "express";
import { StudentMedicalInformationService } from "./student-medical-information.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess } from "../../shared/helpers/response.helper";

const service = new StudentMedicalInformationService(prisma);

/** GET /students/:studentId/medical-information */
export async function getMedicalInfo(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.findByStudentId(studentId);
  sendSuccess(res, data);
}

/** PATCH /students/:studentId/medical-information */
export async function upsertMedicalInfo(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.upsert(studentId, req.body);
  sendSuccess(res, data);
}
