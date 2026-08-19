import { z } from "zod";

/** Validates path params for a single assist record (adds id) */
export const studentAssistIdParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId must be a valid UUID" }),
  academicCycleEnrollmentId: z
    .string()
    .uuid({ message: "academicCycleEnrollmentId must be a valid UUID" }),
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/**
 * Validates GET assists query: page (default 1), pageSize (default 10,
 * matches the frontend's STUDENT_ASSISTS_PAGE_SIZE), fromDate/toDate
 * (optional — ISO or YYYY-MM-DD, doc §2.4). No implicit default range is
 * applied when omitted; the frontend always sends its own default.
 */
export const studentAssistPagedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  fromDate: z.string().min(1).optional(),
  toDate: z.string().min(1).optional(),
});

/** Validates POST body for creating an attendance record */
export const createStudentAssistSchema = z.object({
  assistDate: z.string().min(1, "assistDate is required"),
  status: z.enum(["present", "absent"]),
  absenceReason: z.string().max(1000).optional(),
});

/** Validates PATCH body for updating an attendance record */
export const updateStudentAssistSchema = z
  .object({
    status: z.enum(["present", "absent"]).optional(),
    absenceReason: z.string().max(1000).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
