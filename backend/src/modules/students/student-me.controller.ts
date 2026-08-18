import { Request, Response } from "express";
import { StudentService } from "./student.service";
import { StudentAllergyService } from "./student-allergy.service";
import { StudentGuardianService } from "./student-guardian.service";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import { mailService } from "../../shared/services/mail.service";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { ValidationError } from "../../shared/errors/app-error";
import type { FileUpload } from "./student.types";

/**
 * Handlers for the student-portal "Mi cuenta" endpoints (/students/me/*).
 * Every handler resolves the student from the session (req.student, set by
 * authenticateStudent) — never from a URL param — and delegates entirely to
 * the same services the admin-facing /students module already uses.
 */

const studentService = new StudentService(prisma, storageService, mailService);
const allergyService = new StudentAllergyService(prisma);
const guardianService = new StudentGuardianService(prisma);

/** Minimal multer file shape needed for mapping to FileUpload. */
interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

function mapFile(reqFile: MulterFile | undefined): FileUpload | undefined {
  if (!reqFile) return undefined;

  return {
    buffer: reqFile.buffer,
    originalname: reqFile.originalname,
    mimetype: reqFile.mimetype,
  };
}

/** GET /students/me */
export async function me(req: Request, res: Response): Promise<void> {
  const { studentId } = req.student!;
  const data = await studentService.findById(studentId);
  sendSuccess(res, data);
}

/** GET /students/me/allergies */
export async function myAllergies(req: Request, res: Response): Promise<void> {
  const { studentId } = req.student!;
  const data = await allergyService.findAllByStudentId(studentId);
  sendSuccess(res, data);
}

/** GET /students/me/guardians */
export async function myGuardians(req: Request, res: Response): Promise<void> {
  const { studentId } = req.student!;
  const data = await guardianService.findAllByStudentId(studentId);
  sendSuccess(res, data);
}

/** POST /students/me/avatar (multipart/form-data) */
export async function uploadMyAvatar(
  req: Request,
  res: Response,
): Promise<void> {
  const { studentId } = req.student!;
  const file = mapFile((req as unknown as { file?: MulterFile }).file);

  if (!file) {
    throw new ValidationError("A file is required", [
      { field: "file", message: "A file is required" },
    ]);
  }

  const data = await studentService.uploadAvatar(studentId, file);
  sendSuccess(res, data);
}
