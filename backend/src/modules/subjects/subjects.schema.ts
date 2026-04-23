import { z } from "zod";

/** Schema for creating a new subject */
export const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

/** Schema for updating an existing subject (all fields optional) */
export const updateSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
});

/** Schema for GET query params (listing subjects with search) */
export const subjectQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
});

/** Schema for assigning a subject to a grade */
export const assignSubjectSchema = z.object({
  subjectId: z.number().int().positive("Subject ID is required"),
});
