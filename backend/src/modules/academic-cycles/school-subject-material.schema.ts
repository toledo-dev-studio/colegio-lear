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

// ─── Teacher-facing ("my classes") variants ─────────────────────────────────
// Same resource, scoped by (schoolGroupId, plain schoolSubjectId) — see
// teacher-class-scope.helper.ts.

/** Validates the shared path params for the teacher-facing materials endpoints */
export const teacherMaterialParentParamsSchema = z.object({
  schoolGroupId: z.string().uuid({ message: "schoolGroupId must be a valid UUID" }),
  schoolSubjectId: z.string().uuid({ message: "schoolSubjectId must be a valid UUID" }),
});

/** Validates path params for a single material (adds materialId) */
export const teacherMaterialIdParamsSchema = teacherMaterialParentParamsSchema.extend({
  materialId: z.string().uuid({ message: "materialId must be a valid UUID" }),
});
