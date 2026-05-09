import { z } from "zod";

/** Schema for creating a new group */
export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gradeId: z.number().int().positive("Grade ID is required"),
});

/** Schema for updating an existing group (all fields optional) */
export const updateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

/** Schema for GET query params (listing groups) */
export const groupQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  gradeId: z.coerce.number().optional(),
});
