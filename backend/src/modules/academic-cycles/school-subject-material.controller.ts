import { Request, Response } from "express";
import { SchoolSubjectMaterialService } from "./school-subject-material.service";
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

/** GET .../materials */
export async function findAll(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const data = await service.findAll(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
  );
  sendSuccess(res, data);
}

/** POST .../materials (multipart/form-data) */
export async function create(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
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

  const data = await service.create(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    file,
  );
  sendSuccess(res, data, 201);
}

/** DELETE .../materials/:materialId */
export async function remove(req: Request, res: Response): Promise<void> {
  const { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId } =
    scopeParams(req);
  const { materialId } = req.params as { materialId: string };
  await service.remove(
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    materialId,
  );
  sendNoContent(res);
}
