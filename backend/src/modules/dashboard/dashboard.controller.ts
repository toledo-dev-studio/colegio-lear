import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess } from "../../shared/helpers/response.helper";

/**
 * Shared service instance used by all controller handlers.
 */
const service = new DashboardService(prisma);

/** GET /dashboard/academic-cycles */
export async function getAcademicCyclesSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getAcademicCyclesSummary();
  sendSuccess(res, data);
}

/** GET /dashboard/financial */
export async function getFinancialSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getFinancialSummary();
  sendSuccess(res, data);
}

/** GET /dashboard/announcements */
export async function getAnnouncementsSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getAnnouncementsSummary();
  sendSuccess(res, data);
}

/** GET /dashboard/system */
export async function getSystemSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getSystemSummary();
  sendSuccess(res, data);
}

/** GET /dashboard/teacher-employees */
export async function getLatestTeachers(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.getLatestTeachers();
  sendSuccess(res, data);
}
