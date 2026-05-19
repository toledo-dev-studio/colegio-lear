import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates route params for attachment upload: announcementId (UUID).
 */
export const attachmentParamsSchema = z.object({
  announcementId: z
    .string()
    .uuid({ message: "announcementId must be a valid UUID" }),
});

/**
 * Validates route params for attachment delete: announcementId + attachmentId (both UUID).
 */
export const attachmentDeleteParamsSchema = z.object({
  announcementId: z
    .string()
    .uuid({ message: "announcementId must be a valid UUID" }),
  attachmentId: z
    .string()
    .uuid({ message: "attachmentId must be a valid UUID" }),
});
