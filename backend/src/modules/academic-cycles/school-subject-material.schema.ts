import { z } from "zod";

/** Validates the shared path params for materials nested under a school subject */
export const schoolSubjectMaterialParentParamsSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId must be a valid UUID" }),
  academicCycleSchoolGroupId: z
    .string()
    .uuid({ message: "academicCycleSchoolGroupId must be a valid UUID" }),
  academicCycleSchoolSubjectId: z
    .string()
    .uuid({ message: "academicCycleSchoolSubjectId must be a valid UUID" }),
});

/** Validates path params for a single material (adds materialId) */
export const schoolSubjectMaterialIdParamsSchema =
  schoolSubjectMaterialParentParamsSchema.extend({
    materialId: z.string().uuid({ message: "materialId must be a valid UUID" }),
  });
