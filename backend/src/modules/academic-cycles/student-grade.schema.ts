import { z } from "zod";

/** Validates the shared path params for the teacher-facing grades endpoints */
export const teacherGradeParentParamsSchema = z.object({
  schoolGroupId: z.string().uuid({ message: "schoolGroupId must be a valid UUID" }),
  schoolSubjectId: z.string().uuid({ message: "schoolSubjectId must be a valid UUID" }),
});

/** Validates path params for a single grade (adds gradeId) */
export const teacherGradeIdParamsSchema = teacherGradeParentParamsSchema.extend({
  gradeId: z.string().uuid({ message: "gradeId must be a valid UUID" }),
});

/** Validates PUT body for the upsert (academicCycleEnrollmentId + evaluationNumber + grade) */
export const upsertStudentGradeSchema = z.object({
  academicCycleEnrollmentId: z
    .string()
    .uuid({ message: "academicCycleEnrollmentId must be a valid UUID" }),
  evaluationNumber: z.coerce
    .number({ message: "evaluationNumber must be a number" })
    .int({ message: "evaluationNumber must be an integer" })
    .positive({ message: "evaluationNumber must be a positive integer" }),
  grade: z.coerce
    .number({ message: "grade must be a number" })
    .min(0, "grade must be at least 0")
    .max(10, "grade must be at most 10"),
});
