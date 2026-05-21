import { Request, Response } from "express";
import { EmployeeService } from "./employee.service";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { mailService } from "../../shared/services/mail.service";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import { ValidationError } from "../../shared/errors/app-error";
import type { EmployeeFilters, FileUpload } from "./employee.types";

/** Minimal multer file shape needed for mapping to FileUpload */
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

/** Extended Request type that includes the optional multer file */
interface MulterRequest extends Request {
  file?: MulterFile;
}

/**
 * Shared service instance used by all controller handlers.
 * Receives PrismaClient, IStorageService, and IMailService via DI.
 */
const service = new EmployeeService(prisma, storageService, mailService);

/**
 * Builds an EmployeeFilters object from validated query parameters.
 * Converts the `status` string ("true"/"false") to a boolean.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): EmployeeFilters {
  const filters: EmployeeFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.name !== undefined) filters.name = query.name as string;
  if (query.status !== undefined) filters.status = query.status === "true";
  if (query.roleId !== undefined) filters.roleId = query.roleId as string;
  if (query.jobTitleId !== undefined)
    filters.jobTitleId = query.jobTitleId as string;

  return filters;
}

/**
 * Maps a multer file (req.file) to the FileUpload interface used by the service.
 * Returns undefined if no file is present.
 */
function mapFile(reqFile: MulterFile | undefined): FileUpload | undefined {
  if (!reqFile) return undefined;

  return {
    buffer: reqFile.buffer,
    originalname: reqFile.originalname,
    mimetype: reqFile.mimetype,
  };
}

/**
 * GET /employees
 * Returns all employees matching the optional query filters.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);

  const data = await service.findAll(filters);

  sendSuccess(res, data);
}

/**
 * GET /employees/paged
 * Returns a paginated list of employees matching the optional query filters.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const query = req.query as Record<string, unknown>;
  const filters = buildFilters(query);

  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(filters, { page, limit: pageSize });

  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/**
 * GET /employees/:id
 * Returns a single employee by its UUID with full relations.
 */
export async function findById(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const data = await service.findById(id);

  sendSuccess(res, data);
}

/**
 * POST /employees (multipart/form-data)
 * Creates a new employee with optional file upload.
 * Multer processes the file before this handler runs.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const multerReq = req as MulterRequest;
  const file = mapFile(multerReq.file);

  const data = await service.create(req.body, file);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /employees/:id (multipart/form-data)
 * Partially updates an existing employee with optional file upload.
 * Validates that at least one field or file is present.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const multerReq = req as MulterRequest;
  const file = mapFile(multerReq.file);

  // Validate at least one field or file is present
  const hasFields = Object.values(req.body).some(
    (v) => v !== undefined && v !== "",
  );
  if (!hasFields && !file) {
    throw new ValidationError("At least one field or file is required", [
      { field: "body", message: "At least one field or file is required" },
    ]);
  }

  const data = await service.update(id, req.body, file);

  sendSuccess(res, data);
}

/**
 * DELETE /employees/:id
 * Soft-deletes an employee by setting isDeleted to true.
 */
export async function softDelete(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  await service.softDelete(id);

  sendNoContent(res);
}

/**
 * POST /employees/:id/resend-invitation
 * Regenerates a temporary password and resends the invitation email.
 */
export async function resendInvitation(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };

  await service.resendInvitation(id);

  sendSuccess(res, 204);
}
