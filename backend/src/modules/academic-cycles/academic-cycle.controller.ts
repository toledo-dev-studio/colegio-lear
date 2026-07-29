import { Request, Response } from "express";
import { AcademicCycleService } from "./academic-cycle.service";
import { prisma } from "../../shared/lib/prisma";
import { mailService } from "../../shared/services/mail.service";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { AcademicCycleFilters } from "./academic-cycle.types";

const service = new AcademicCycleService(prisma, mailService);

function buildFilters(query: Record<string, unknown>): AcademicCycleFilters {
  const filters: AcademicCycleFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.code !== undefined) filters.code = query.code as string;
  if (query.startDate !== undefined)
    filters.startDate = query.startDate as string;
  if (query.endDate !== undefined) filters.endDate = query.endDate as string;
  if (query.periodType !== undefined)
    filters.periodType = query.periodType as NonNullable<
      AcademicCycleFilters["periodType"]
    >;
  if (query.enrollmentOpen !== undefined)
    filters.enrollmentOpen = query.enrollmentOpen === "true";
  if (query.status !== undefined)
    filters.status = query.status as NonNullable<
      AcademicCycleFilters["status"]
    >;

  return filters;
}

/** GET /academic-cycles */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);
  const data = await service.findAll(filters);
  sendSuccess(res, data);
}

/** GET /academic-cycles/paged */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const query = req.query as Record<string, unknown>;
  const filters = buildFilters(query);
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(filters, { page, pageSize });
  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/** GET /academic-cycles/:id */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await service.findById(id);
  sendSuccess(res, data);
}

/** POST /academic-cycles */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /academic-cycles/:id */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { employeeId } = req.user!;
  const data = await service.update(id, req.body, employeeId);
  sendSuccess(res, data);
}

/** DELETE /academic-cycles/:id */
export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await service.remove(id);
  sendNoContent(res);
}
