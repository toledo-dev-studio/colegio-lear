import { Request, Response } from "express";
import { StudentService } from "./student.service";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { mailService } from "../../shared/services/mail.service";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import type { StudentFilters } from "./student.types";

const service = new StudentService(prisma, storageService, mailService);

function buildFilters(query: Record<string, unknown>): StudentFilters {
  const filters: StudentFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.fullName !== undefined) filters.fullName = query.fullName as string;
  if (query.curp !== undefined) filters.curp = query.curp as string;
  if (query.enrollment !== undefined)
    filters.enrollment = query.enrollment as string;
  if (query.email !== undefined) filters.email = query.email as string;
  if (query.phoneNumber !== undefined)
    filters.phoneNumber = query.phoneNumber as string;
  if (query.isActive !== undefined)
    filters.isActive = query.isActive === "true";

  return filters;
}

/** GET /students */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);
  const data = await service.findAll(filters);
  sendSuccess(res, data);
}

/** GET /students/paged */
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

/** GET /students/:id */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await service.findById(id);
  sendSuccess(res, data);
}

/** POST /students */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);
  sendSuccess(res, data, 201);
}

/** PATCH /students/:id */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const data = await service.update(id, req.body);
  sendSuccess(res, data);
}

/** DELETE /students/:id */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  await service.softDelete(id);
  sendNoContent(res);
}

/** POST /students/:id/send-credentials */
export async function sendCredentials(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  await service.sendCredentials(id);
  sendSuccess(res, null);
}
