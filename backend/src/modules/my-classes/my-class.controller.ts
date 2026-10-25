import { Request, Response } from "express";
import { MyClassService } from "./my-class.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import type { MyClassFilters } from "./my-class.types";

const service = new MyClassService(prisma);

function buildFilters(query: Record<string, unknown>): MyClassFilters {
  const filters: MyClassFilters = {};
  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined)
    filters.status = query.status as NonNullable<MyClassFilters["status"]>;
  if (query.academicCycleStatus !== undefined)
    filters.academicCycleStatus =
      query.academicCycleStatus as NonNullable<MyClassFilters["academicCycleStatus"]>;
  return filters;
}

/** GET /me/school-groups/paged */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { employeeId } = req.user!;
  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(employeeId, buildFilters(query), {
    page,
    limit: pageSize,
  });

  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/** GET /me/school-groups/:id */
export async function findById(req: Request, res: Response): Promise<void> {
  const { employeeId } = req.user!;
  const { id } = req.params as { id: string };

  const data = await service.findById(employeeId, id);

  sendSuccess(res, data);
}
