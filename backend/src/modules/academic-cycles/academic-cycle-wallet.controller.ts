import { Request, Response } from "express";
import { AcademicCycleWalletService } from "./academic-cycle-wallet.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";

const service = new AcademicCycleWalletService(prisma);

/** GET /academic-cycles/:academicCycleId/wallet */
export async function findAllWalletItems(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.findAll(academicCycleId);
  sendSuccess(res, data);
}

/** POST /academic-cycles/:academicCycleId/wallet */
export async function createWalletItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.create(academicCycleId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /academic-cycles/:academicCycleId/wallet/:id */
export async function updateWalletItem(
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

/** DELETE /academic-cycles/:academicCycleId/wallet/:id */
export async function deleteWalletItem(
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
