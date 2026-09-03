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
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/**
 * Shared service instance used by all controller handlers.
 * Receives PrismaClient, IStorageService, and IMailService via DI.
 */
const service = new EmployeeService(prisma, storageService, mailService);

/**
 * Builds an EmployeeFilters object from validated query parameters.
 * Converts the `isActive` string ("true"/"false") to a boolean.
 * Only includes properties that are actually defined to satisfy exactOptionalPropertyTypes.
 */
function buildFilters(query: Record<string, unknown>): EmployeeFilters {
  const filters: EmployeeFilters = {};

  if (query.q !== undefined) filters.q = query.q as string;
  if (query.fullName !== undefined) filters.fullName = query.fullName as string;
  if (query.isActive !== undefined)
    filters.isActive = query.isActive === "true";
  if (query.securityRoleId !== undefined)
    filters.securityRoleId = query.securityRoleId as string;
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
 * Excludes the authenticated employee from results.
 */
export async function findAll(req: Request, res: Response): Promise<void> {
  const filters = buildFilters(req.query as Record<string, unknown>);
  const { employeeId } = req.user!;

  const data = await service.findAll(filters, employeeId);

  sendSuccess(res, data);
}

/**
 * GET /employees/paged
 * Returns a paginated list of employees matching the optional query filters.
 * Excludes the authenticated employee from results.
 */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const query = req.query as Record<string, unknown>;
  const filters = buildFilters(query);
  const { employeeId } = req.user!;

  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(
    filters,
    { page, limit: pageSize },
    employeeId,
  );

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
 * POST /employees (application/json)
 * Creates a new employee. Avatar is uploaded separately via
 * POST /employees/:id/avatar once the employee exists.
 */
export async function create(req: Request, res: Response): Promise<void> {
  const data = await service.create(req.body);

  sendSuccess(res, data, 201);
}

/**
 * PATCH /employees/:id (application/json)
 * Partially updates an existing employee. Validates that at least one field is present.
 * Avatar is updated separately via POST /employees/:id/avatar.
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  // Validate at least one field is present
  const hasFields = Object.values(req.body).some(
    (v) => v !== undefined && v !== "",
  );
  if (!hasFields) {
    throw new ValidationError("Se requiere al menos un campo", [
      { field: "body", message: "Se requiere al menos un campo" },
    ]);
  }

  const data = await service.update(id, req.body);

  sendSuccess(res, data);
}

/**
 * POST /employees/:id/avatar (multipart/form-data)
 * Uploads or replaces an employee's avatar. Requires a file.
 */
export async function uploadAvatarById(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const file = mapFile((req as unknown as { file?: MulterFile }).file);

  if (!file) {
    throw new ValidationError("El archivo es requerido", [
      { field: "file", message: "El archivo es requerido" },
    ]);
  }

  const data = await service.uploadAvatar(id, file);

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

/**
 * PATCH /employees/me (application/json)
 * Updates the authenticated employee's own account.
 * Required fields: name, firstLastName, phoneNumber.
 * Optional: secondLastName. Avatar is updated separately via POST /employees/me/avatar.
 * Returns the same shape as GET /auth/me (LoginResponse).
 */
export async function updateMyAccount(
  req: Request,
  res: Response,
): Promise<void> {
  const { employeeId } = req.user!;

  const data = await service.updateMyAccount(employeeId, req.body);

  sendSuccess(res, data);
}

/**
 * POST /employees/me/avatar (multipart/form-data)
 * Uploads or replaces the authenticated employee's own avatar. Requires a file.
 * Returns the same shape as GET /auth/me (LoginResponse).
 */
export async function uploadMyAvatar(
  req: Request,
  res: Response,
): Promise<void> {
  const { employeeId } = req.user!;
  const file = mapFile((req as unknown as { file?: MulterFile }).file);

  if (!file) {
    throw new ValidationError("El archivo es requerido", [
      { field: "file", message: "El archivo es requerido" },
    ]);
  }

  const data = await service.uploadMyAvatar(employeeId, file);

  sendSuccess(res, data);
}

/**
 * GET /employees/teachers
 * Returns all active employees whose jobTitle type is "teacher".
 */
export async function findAllTeachers(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await service.findAllTeachers();
  sendSuccess(res, data);
}
