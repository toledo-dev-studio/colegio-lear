import { Request, Response } from "express";
import { SchoolSubjectMaterialService } from "./school-subject-material.service";
import { resolveTeacherSubjectScope } from "./teacher-class-scope.helper";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { sendSuccess, sendNoContent } from "../../shared/helpers/response.helper";
import { ValidationError } from "../../shared/errors/app-error";
import type { FileUpload } from "./school-subject-material.types";

const service = new SchoolSubjectMaterialService(prisma, storageService);

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

/** GET /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials */
export async function findAll(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { employeeId } = req.user!;

  const scope = await resolveTeacherSubjectScope(
    prisma,
    employeeId,
    schoolGroupId,
    schoolSubjectId,
  );

  const data = await service.findAllFlat(
    scope.academicCycleId,
    schoolGroupId,
    scope.academicCycleSchoolSubjectId,
    schoolSubjectId,
  );
  sendSuccess(res, data);
}

/**
 * POST /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials
 * (multipart/form-data, field "file")
 */
export async function create(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { employeeId } = req.user!;
  const multerFile = (req as unknown as { file?: MulterFile }).file;

  if (!multerFile) {
    throw new ValidationError("File is required", [
      { field: "file", message: "File is required" },
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

  const data = await service.createFlat(
    scope.academicCycleId,
    schoolGroupId,
    scope.academicCycleSchoolSubjectId,
    schoolSubjectId,
    file,
  );
  sendSuccess(res, data, 201);
}

/** DELETE /me/school-groups/:schoolGroupId/subjects/:schoolSubjectId/materials/:materialId */
export async function remove(req: Request, res: Response): Promise<void> {
  const { schoolGroupId, schoolSubjectId } = scopeParams(req);
  const { materialId } = req.params as { materialId: string };
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
    materialId,
  );
  sendNoContent(res);
}
