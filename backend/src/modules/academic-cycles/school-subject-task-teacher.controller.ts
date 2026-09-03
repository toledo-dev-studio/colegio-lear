import { Request, Response } from "express";
import { SchoolSubjectTaskService } from "./school-subject-task.service";
import { resolveTeacherSubjectScope } from "./teacher-class-scope.helper";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";
import { ValidationError } from "../../shared/errors/app-error";
import type { FileUpload } from "./school-subject-task.types";

const service = new SchoolSubjectTaskService(prisma, storageService);

/** Minimal multer file shape needed for mapping to FileUpload */
interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

function scopeParams(req: Request) {
  const { schoolGroupId, schoolSubjectId } = req.params as {
    schoolGroupId: string;
    schoolSubjectId: string;
  };
  return { schoolGroupId, schoolSubjectId };
}

/** GET /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks */
export async function findAll(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { employeeId } = req.user!;

  const scope = await resolveTeacherSubjectScope(
    prisma,
    employeeId,
    schoolGroupId,
    schoolSubjectId,
  );

  const data = await service.findAll(
    scope.academicCycleId,
    schoolGroupId,
    scope.academicCycleSchoolSubjectId,
  );
  sendSuccess(res, data);
}

/**
 * POST /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks
 * Upsert: an absent `id` creates, a real UUID updates.
 */
export async function createOrUpdate(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { employeeId } = req.user!;
  const { id, ...dto } = req.body as {
    id?: string;
    title: string;
    description?: string;
    dueDate: string;
  };

  const scope = await resolveTeacherSubjectScope(
    prisma,
    employeeId,
    schoolGroupId,
    schoolSubjectId,
  );

  const data = id
    ? await service.update(
        scope.academicCycleId,
        schoolGroupId,
        scope.academicCycleSchoolSubjectId,
        id,
        dto,
      )
    : await service.create(
        scope.academicCycleId,
        schoolGroupId,
        scope.academicCycleSchoolSubjectId,
        dto,
      );

  sendSuccess(res, data);
}

/** DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId */
export async function remove(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { taskId } = req.params as { taskId: string };
  const { employeeId } = req.user!;

  const scope = await resolveTeacherSubjectScope(
    prisma,
    employeeId,
    schoolGroupId,
    schoolSubjectId,
  );

  await service.remove(
    scope.academicCycleId,
    schoolGroupId,
    scope.academicCycleSchoolSubjectId,
    taskId,
  );
  sendNoContent(res);
}

/**
 * POST /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/tasks/:taskId/attachments
 * (multipart/form-data, field "file")
 */
export async function addAttachment(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { taskId } = req.params as { taskId: string };
  const { employeeId } = req.user!;
  const multerFile = (req as unknown as { file?: MulterFile }).file;

  if (!multerFile) {
    throw new ValidationError("El archivo es obligatorio", [
      { field: "file", message: "El archivo es obligatorio" },
    ]);
  }

  const scope = await resolveTeacherSubjectScope(
    prisma,
    employeeId,
    schoolGroupId,
    schoolSubjectId,
  );

  const file: FileUpload = {
    buffer: multerFile.buffer,
    originalname: multerFile.originalname,
    mimetype: multerFile.mimetype,
  };

  const data = await service.addAttachmentRecord(
    scope.academicCycleId,
    schoolGroupId,
    scope.academicCycleSchoolSubjectId,
    taskId,
    file,
  );
  sendSuccess(res, data, 201);
}

/** DELETE .../tasks/:taskId/attachments/:attachmentId */
export async function removeAttachment(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { taskId, attachmentId } = req.params as { taskId: string; attachmentId: string };
  const { employeeId } = req.user!;

  const scope = await resolveTeacherSubjectScope(
    prisma,
    employeeId,
    schoolGroupId,
    schoolSubjectId,
  );

  await service.removeAttachment(
    scope.academicCycleId,
    schoolGroupId,
    scope.academicCycleSchoolSubjectId,
    taskId,
    attachmentId,
  );
  sendNoContent(res);
}
