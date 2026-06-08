import { z } from "zod";

/** Validates POST body for creating an academic cycle school subject */
export const createAcademicCycleSchoolSubjectSchema = z.object({
  schoolSubjectId: z
    .string()
    .uuid({ message: "schoolSubjectId must be a valid UUID" }),
  observations: z.string().max(1000).optional(),
});

/** Validates PATCH body for updating an academic cycle school subject */
export const updateAcademicCycleSchoolSubjectSchema = z
  .object({
    schoolSubjectId: z.string().uuid().optional(),
    observations: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
