import { Router } from "express";
import multer from "multer";
import { validate } from "../../shared/middleware/validate.middleware";
import {
  attachmentParamsSchema,
  attachmentDeleteParamsSchema,
} from "./attachment.schema";
import { upload as uploadHandler, remove } from "./attachment.controller";

/**
 * In-memory storage — file is available as req.file.buffer.
 * Limits file size to 10MB. No MIME type restriction (announcements
 * can have PDFs, images, docs, etc.).
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadSingle = upload.single("file");

const router = Router();

/**
 * @openapi
 * /attachments/announcement/{announcementId}:
 *   post:
 *     tags:
 *       - Attachments
 *     summary: Upload an attachment to an announcement
 *     description: Uploads a file and associates it with the specified announcement. Accepts any file type up to 10MB.
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Announcement UUID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (any type, max 10MB)
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Validation error (invalid UUID or missing file)
 *       404:
 *         description: Announcement not found
 */
router.post(
  "/announcement/:announcementId",
  uploadSingle,
  validate(attachmentParamsSchema, "params"),
  uploadHandler,
);

/**
 * @openapi
 * /attachments/announcement/{announcementId}/{attachmentId}:
 *   delete:
 *     tags:
 *       - Attachments
 *     summary: Delete an attachment from an announcement
 *     description: Removes the attachment from storage and the database.
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Announcement UUID
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attachment UUID
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Announcement or attachment not found
 */
router.delete(
  "/announcement/:announcementId/:attachmentId",
  validate(attachmentDeleteParamsSchema, "params"),
  remove,
);

export default router;
