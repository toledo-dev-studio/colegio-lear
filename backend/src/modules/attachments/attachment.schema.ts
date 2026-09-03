import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates route params for attachment upload: announcementId (UUID).
 */
export const attachmentParamsSchema = z.object({
  announcementId: z
    .string()
    .uuid({ message: "announcementId debe ser un UUID válido" }),
});

/**
 * Validates route params for attachment delete: announcementId + attachmentId (both UUID).
 */
export const attachmentDeleteParamsSchema = z.object({
  announcementId: z
    .string()
    .uuid({ message: "announcementId debe ser un UUID válido" }),
  attachmentId: z
    .string()
    .uuid({ message: "attachmentId debe ser un UUID válido" }),
});
