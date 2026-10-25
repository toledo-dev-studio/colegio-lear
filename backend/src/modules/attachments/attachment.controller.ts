import { Request, Response } from "express";
import { AttachmentService } from "./attachment.service";
import { prisma } from "../../shared/lib/prisma";
import { storageService } from "../../shared/services/storage.service";
import {
  sendSuccess,
  sendNoContent,
} from "../../shared/helpers/response.helper";
import { ValidationError } from "../../shared/errors/app-error";
import type { FileUpload } from "./attachment.types";

/** Minimal multer file shape needed for mapping to FileUpload */
interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

/**
 * Shared service instance used by all controller handlers.
 * Receives PrismaClient and IStorageService via DI.
 */
const service = new AttachmentService(prisma, storageService);

/**
 * POST /attachments/announcement/:announcementId
 * Uploads a file and associates it with the specified announcement.
 * Multer processes the file before this handler runs.
 */
export async function upload(req: Request, res: Response): Promise<void> {
  const multerFile = (req as unknown as { file?: MulterFile }).file;

  if (!multerFile) {
    throw new ValidationError("El archivo es requerido", [
      { field: "file", message: "El archivo es requerido" },
    ]);
  }

  const { announcementId } = req.params as { announcementId: string };

  const file: FileUpload = {
    buffer: multerFile.buffer,
    originalname: multerFile.originalname,
    mimetype: multerFile.mimetype,
  };

  const data = await service.upload(announcementId, file);

  sendSuccess(res, data, 201);
}

/**
 * DELETE /attachments/announcement/:announcementId/:attachmentId
 * Removes an attachment from storage and the database.
 */
export async function remove(req: Request, res: Response): Promise<void> {
  const { announcementId, attachmentId } = req.params as {
    announcementId: string;
    attachmentId: string;
  };

  await service.delete(announcementId, attachmentId);

  sendNoContent(res);
}
