import { Request, Response } from "express";
import { SchoolSubjectTaskService } from "./school-subject-task.service";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import {
  sendSuccess,
  sendNoContent,
  sendPaginatedSuccess,
} from "../../shared/helpers/response.helper";
import { ValidationError } from "../../shared/errors/app-error";
import type { FileUpload } from "./school-subject-task.types";

const service = new SchoolSubjectTaskService(prisma, storageService);

/** Minimal multer file shape needed for mapping to FileUpload */
interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

function scopeParams(req: Request) {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    req.params as {
      academicCycleId: string;
      academicCycleSchoolGroupId: string;
      academicCycleSchoolSubjectId: string;
    };
  return { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId };
}

/** GET .../tasks (paginated) */
export async function findAllPaged(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findAllPaged(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
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

/** POST .../tasks */
export async function create(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const data = await service.create(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    req.body,
  );
  sendSuccess(res, data, 201);
}

/** PATCH .../tasks/:taskId */
export async function update(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const { taskId } = req.params as { taskId: string };
  const data = await service.update(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    taskId,
    req.body,
  );
  sendSuccess(res, data);
}

/** DELETE .../tasks/:taskId */
export async function remove(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const { taskId } = req.params as { taskId: string };
  await service.remove(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    taskId,
  );
  sendNoContent(res);
}

/** POST .../tasks/:taskId/attachments (multipart/form-data) */
export async function addAttachment(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const { taskId } = req.params as { taskId: string };
  const multerFile = (req as unknown as { file?: MulterFile }).file;

  if (!multerFile) {
    throw new ValidationError("El archivo es obligatorio", [
      { field: "file", message: "El archivo es obligatorio" },
    ]);
  }

  const file: FileUpload = {
    buffer: multerFile.buffer,
    originalname: multerFile.originalname,
    mimetype: multerFile.mimetype,
  };

  const data = await service.addAttachment(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    taskId,
    file,
  );
  sendSuccess(res, data, 201);
}

/** DELETE .../tasks/:taskId/attachments/:attachmentId */
export async function removeAttachment(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const { taskId, attachmentId } = req.params as {
    taskId: string;
    attachmentId: string;
  };
  await service.removeAttachment(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    taskId,
    attachmentId,
  );
  sendNoContent(res);
}
