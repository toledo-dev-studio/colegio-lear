import { Request, Response } from "express";
import { StudentWalletService } from "./student-wallet.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess } from "../../shared/helpers/response.helper";

const service = new StudentWalletService(prisma);

/** GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet */
export async function findWallet(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
  };
  const data = await service.findWallet(academicCycleId, academicCycleEnrollmentId);
  sendSuccess(res, data);
}

/** GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/payments */
export async function findPayments(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
  };
  const data = await service.findPayments(
    academicCycleId,
    academicCycleEnrollmentId,
  );
  sendSuccess(res, data);
}

/** PATCH /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/:id */
export async function updateItem(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId, id } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    id: string;
  };
  const data = await service.updateItem(
    academicCycleId,
    academicCycleEnrollmentId,
    id,
    req.body,
  );
  sendSuccess(res, data);
}

/** POST /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/wallet/:id/payments */
export async function createPayment(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId, id } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    id: string;
  };
  const data = await service.createPayment(
    academicCycleId,
    academicCycleEnrollmentId,
    id,
    req.body,
  );
  sendSuccess(res, data, 201);
}
