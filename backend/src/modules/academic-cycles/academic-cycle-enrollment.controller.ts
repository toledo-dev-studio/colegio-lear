import { Request, Response } from "express";
import { AcademicCycleEnrollmentService } from "./academic-cycle-enrollment.service";
import { prisma } from "../../shared/lib/prisma";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { AcademicCycleEnrollmentFilters } from "./academic-cycle-enrollment.types";

const service = new AcademicCycleEnrollmentService(prisma);

function buildFilters(
  query: Record<string, unknown>,
): AcademicCycleEnrollmentFilters {
  const filters: AcademicCycleEnrollmentFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.status !== undefined)
    filters.status = query.status as NonNullable<
      AcademicCycleEnrollmentFilters["status"]
    >;
  if (query.academicCycleSchoolGroupId !== undefined)
    filters.academicCycleSchoolGroupId =
      query.academicCycleSchoolGroupId as string;
  if (query.scholarshipId !== undefined)
    filters.scholarshipId = query.scholarshipId as string;

  return filters;
}

/** GET /academic-cycles/:academicCycleId/enrollments/paged */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const query = req.query as Record<string, unknown>;
  const filters = buildFilters(query);
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(academicCycleId, filters, {
    page,
    pageSize,
  });
  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/** GET /academic-cycles/:academicCycleId/enrollments/:id */
export async function findById(req: Request, res: Response): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  const data = await service.findById(academicCycleId, id);
  sendSuccess(res, data);
}

/** POST /academic-cycles/:academicCycleId/enrollments */
export async function create(req: Request, res: Response): Promise<void> {
  const { academicCycleId } = req.params as { academicCycleId: string };
  const data = await service.create(academicCycleId, req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /academic-cycles/:academicCycleId/enrollments/:id */
export async function update(req: Request, res: Response): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  const data = await service.update(academicCycleId, id, req.body);
  sendSuccess(res, data);
}

/** DELETE /academic-cycles/:academicCycleId/enrollments/:id */
export async function remove(req: Request, res: Response): Promise<void> {
  const { academicCycleId, id } = req.params as {
    academicCycleId: string;
    id: string;
  };
  await service.remove(academicCycleId, id);
  sendNoContent(res);
}

/** GET /students/:studentId/enrollments */
export async function findAllForStudent(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.params as { studentId: string };
  const data = await service.findAllByStudentId(studentId);
  sendSuccess(res, data);
}
