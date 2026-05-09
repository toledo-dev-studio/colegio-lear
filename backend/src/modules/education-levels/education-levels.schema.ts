import { z } from "zod";

/** Schema for creating a new education level */
export const createEducationLevelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().positive().optional(),
});

/** Schema for updating an existing education level (all fields optional) */
export const updateEducationLevelSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  order: z.number().int().positive().optional(),
});

/** Schema for GET query params (listing education levels) */
export const educationLevelQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
