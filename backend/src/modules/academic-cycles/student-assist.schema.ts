import { z } from "zod";

/** Validates path params for a single assist record (adds id) */
export const studentAssistIdParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId debe ser un UUID válido" }),
  academicCycleEnrollmentId: z
    .string()
    .uuid({ message: "academicCycleEnrollmentId debe ser un UUID válido" }),
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
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
  assistDate: z.string().min(1, "assistDate es requerido"),
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
    message: "Se requiere al menos un campo",
  });

// ─── Teacher-facing ("my classes") group attendance ─────────────────────────

/** Validates path params for the group attendance endpoints */
export const teacherAssistGroupParamsSchema = z.object({
  academicCycleId: z.string().uuid({ message: "academicCycleId debe ser un UUID válido" }),
  schoolGroupId: z.string().uuid({ message: "schoolGroupId debe ser un UUID válido" }),
});

/** Validates GET group attendance query: assistDate (required, ISO or YYYY-MM-DD) */
export const teacherAssistDayQuerySchema = z.object({
  assistDate: z.string().min(1, "assistDate es requerido"),
});

/** Validates POST body for the bulk group attendance upsert */
export const upsertGroupAssistsSchema = z.object({
  assistDate: z.string().min(1, "assistDate es requerido"),
  assists: z
    .array(
      z.object({
        academicCycleEnrollmentId: z
          .string()
          .uuid({ message: "academicCycleEnrollmentId debe ser un UUID válido" }),
        status: z.enum(["present", "absent"]),
        absenceReason: z.string().max(1000).nullable().optional(),
      }),
    )
    .min(1, "assists debe tener al menos un registro"),
});
