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
 * Receives PrismaClient and IStorageService via DI.
 */
const service = new AttachmentService(prisma, storageService);

/**
 * POST /attachments/announcement/:announcementId
 * Uploads a file and associates it with the specified announcement.
 * Multer processes the file before this handler runs.
 */
export async function upload(req: Request, res: Response): Promise<void> {
  const multerReq = req as MulterRequest;

  if (!multerReq.file) {
    throw new ValidationError("File is required", [
      { field: "file", message: "File is required" },
    ]);
  }

  const { announcementId } = req.params as { announcementId: string };

  const file: FileUpload = {
    buffer: multerReq.file.buffer,
    originalname: multerReq.file.originalname,
    mimetype: multerReq.file.mimetype,
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
