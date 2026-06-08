import { Request, Response } from "express";
import { StudentGuardianService } from "./student-guardian.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";

const service = new StudentGuardianService(prisma);

/** GET /students/:studentId/guardians */
export async function findAllGuardians(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.findAllByStudentId(studentId);
  sendSuccess(res, data);
}

/** POST /students/:studentId/guardians */
export async function createGuardian(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.create(studentId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /students/:studentId/guardians/:id */
export async function updateGuardian(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId, id } = req.params as { studentId: string; id: string };
  const data = await service.update(studentId, id, req.body);
  sendSuccess(res, data);
}

/** DELETE /students/:studentId/guardians/:id */
export async function deleteGuardian(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId, id } = req.params as { studentId: string; id: string };
  await service.delete(studentId, id);
  sendNoContent(res);
}
