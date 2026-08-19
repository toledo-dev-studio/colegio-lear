import { Request, Response } from "express";
import { StudentAssistService } from "./student-assist.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { StudentAssistFilters } from "./student-assist.types";

const service = new StudentAssistService(prisma);

function buildFilters(query: Record<string, unknown>): StudentAssistFilters {
  const filters: StudentAssistFilters = {};
  if (query.fromDate !== undefined) filters.fromDate = query.fromDate as string;
  if (query.toDate !== undefined) filters.toDate = query.toDate as string;
  return filters;
}

/** GET /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
  };
  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(
    academicCycleId,
    academicCycleEnrollmentId,
    buildFilters(query),
    { page, pageSize },
  );
  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/** POST /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists */
export async function create(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
  };
  const data = await service.create(academicCycleId, academicCycleEnrollmentId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists/:id */
export async function update(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId, id } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    id: string;
  };
  const data = await service.update(academicCycleId, academicCycleEnrollmentId, id, req.body);
  sendSuccess(res, data);
}

/** DELETE /academic-cycles/:academicCycleId/enrollments/:academicCycleEnrollmentId/assists/:id */
export async function remove(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleEnrollmentId, id } = req.params as {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
    id: string;
  };
  await service.remove(academicCycleId, academicCycleEnrollmentId, id);
  sendNoContent(res);
}
