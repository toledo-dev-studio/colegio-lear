import { z } from "zod";

/** Validates the shared path params for the teacher-facing grades endpoints */
export const teacherGradeParentParamsSchema = z.object({
  schoolGroupId: z.string().uuid({ message: "schoolGroupId debe ser un UUID válido" }),
  schoolSubjectId: z.string().uuid({ message: "schoolSubjectId debe ser un UUID válido" }),
});

/** Validates path params for a single grade (adds gradeId) */
export const teacherGradeIdParamsSchema = teacherGradeParentParamsSchema.extend({
  gradeId: z.string().uuid({ message: "gradeId debe ser un UUID válido" }),
});

/** Validates PUT body for the upsert (academicCycleEnrollmentId + evaluationNumber + grade) */
export const upsertStudentGradeSchema = z.object({
  academicCycleEnrollmentId: z
    .string()
    .uuid({ message: "academicCycleEnrollmentId debe ser un UUID válido" }),
  evaluationNumber: z.coerce
    .number({ message: "evaluationNumber debe ser un número" })
    .int({ message: "evaluationNumber debe ser un número entero" })
    .positive({ message: "evaluationNumber debe ser un entero positivo" }),
  grade: z.coerce
    .number({ message: "grade debe ser un número" })
    .min(0, "grade debe ser al menos 0")
    .max(10, "grade debe ser como máximo 10"),
});
