import { Request, Response } from "express";
import { StudentAllergyService } from "./student-allergy.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";

const service = new StudentAllergyService(prisma);

/** GET /students/:studentId/allergies */
export async function findAllAllergies(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.findAllByStudentId(studentId);
  sendSuccess(res, data);
}

/** POST /students/:studentId/allergies */
export async function createAllergy(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.create(studentId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /students/:studentId/allergies/:id */
export async function updateAllergy(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId, id } = req.params as { studentId: string; id: string };
  const data = await service.update(studentId, id, req.body);
  sendSuccess(res, data);
}

/** DELETE /students/:studentId/allergies/:id */
export async function deleteAllergy(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId, id } = req.params as { studentId: string; id: string };
  await service.delete(studentId, id);
  sendNoContent(res);
}
