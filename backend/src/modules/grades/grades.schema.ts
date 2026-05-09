import { z } from "zod";

/** Schema for creating a new grade */
export const createGradeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  educationLevelId: z.number().int().positive("Education level ID is required"),
  description: z.string().optional(),
  order: z.number().int().positive().optional(),
});

/** Schema for updating an existing grade (all fields optional) */
export const updateGradeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  order: z.number().int().positive().optional(),
});

/** Schema for GET query params (listing grades) */
export const gradeQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  educationLevelId: z.coerce.number().optional(),
});
