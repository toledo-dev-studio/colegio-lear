import { z } from "zod";

/** Validates the shared path params for tasks nested under a school subject */
export const schoolSubjectTaskParentParamsSchema = z.object({
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

/** Validates path params for a single task (adds taskId) */
export const schoolSubjectTaskIdParamsSchema =
  schoolSubjectTaskParentParamsSchema.extend({
    taskId: z.string().uuid({ message: "taskId must be a valid UUID" }),
  });

/** Validates path params for a task attachment (adds attachmentId) */
export const schoolSubjectTaskAttachmentIdParamsSchema =
  schoolSubjectTaskIdParamsSchema.extend({
    attachmentId: z
      .string()
      .uuid({ message: "attachmentId must be a valid UUID" }),
  });

/** Validates GET tasks query: page (default 1), pageSize (default 5, matches the frontend's SCHOOL_SUBJECT_TASKS_PAGE_SIZE) */
export const schoolSubjectTaskPagedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(5),
});

/** Validates POST body for creating a task */
export const createSchoolSubjectTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().min(1, "dueDate is required"),
});

/** Validates PATCH body for updating a task */
export const updateSchoolSubjectTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    dueDate: z.string().min(1).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
