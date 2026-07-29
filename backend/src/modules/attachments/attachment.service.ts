import * as path from "path";

import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError } from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type { IStorageService } from "../../shared/services/storage.service";
import type { AttachmentRecord, FileUpload } from "./attachment.types";

/**
 * Business logic layer for the Attachments module.
 * Handles file upload and deletion for announcement attachments.
 * Uses IStorageService for file persistence and PrismaClient for DB operations.
 */
export class AttachmentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: IStorageService,
  ) {}

  /**
   * Upload a file and associate it with an announcement.
   * Verifies the announcement exists, uploads the file to storage,
   * extracts name/extension from the original filename, and creates
   * the Attachment record in the database.
   * @param announcementId - UUID of the parent announcement
   * @param file - File upload data (buffer, originalname, mimetype)
   * @returns The created AttachmentRecord
   * @throws NotFoundError if the announcement does not exist
   */
  async upload(
    announcementId: string,
    file: FileUpload,
  ): Promise<AttachmentRecord> {
    // Verify announcement exists
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundError("Comunicado no encontrado");
    }

    // Upload file to storage
    const url = await this.storage.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subfolder: "announcements",
    });

    // Extract name and extension from original filename
    const parsed = path.parse(file.originalname);
    const name = parsed.name;
    const extension = parsed.ext.replace(".", "");

    // Create Attachment record in the database
    const attachment = await this.prisma.attachment.create({
      data: {
        url,
        name,
        extension,
        relatedRecordId: announcementId,
      },
    });

    return {
      id: attachment.id,
      url: toPublicFileUrl(attachment.url),
      name: attachment.name,
      extension: attachment.extension,
      relatedRecordId: attachment.relatedRecordId,
    };
  }

  /**
   * Delete an attachment from storage and the database.
   * Verifies both the announcement and the attachment exist,
   * removes the file from storage, then deletes the DB record.
   * @param announcementId - UUID of the parent announcement
   * @param attachmentId - UUID of the attachment to delete
   * @throws NotFoundError if the announcement or attachment does not exist
   */
  async delete(announcementId: string, attachmentId: string): Promise<void> {
    // Verify announcement exists
    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new NotFoundError("Comunicado no encontrado");
    }

    // Find attachment by id AND relatedRecordId
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        relatedRecordId: announcementId,
      },
    });

    if (!attachment) {
      throw new NotFoundError("Archivo adjunto no encontrado");
    }

    // Delete from storage
    await this.storage.delete(attachment.url);

    // Delete from database
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });
  }
}
