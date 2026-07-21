import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────

const statusEnum = z.enum(["enrolled", "completed", "dropped"]);

// ─── Param Schemas ──────────────────────────────────────────────────────────

/** Validates academicCycleId + academicCycleEnrollmentId path parameters */
export const academicCycleEnrollmentIdParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId must be a valid UUID" }),
  academicCycleEnrollmentId: z
    .string()
    .uuid({ message: "academicCycleEnrollmentId must be a valid UUID" }),
});

/** Validates academicCycleId + academicCycleEnrollmentId + id (wallet item) path parameters */
export const academicCycleEnrollmentWalletItemParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId must be a valid UUID" }),
  academicCycleEnrollmentId: z
    .string()
    .uuid({ message: "academicCycleEnrollmentId must be a valid UUID" }),
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

// ─── Filter Schemas ─────────────────────────────────────────────────────────

export const academicCycleEnrollmentFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  status: statusEnum.optional(),
  academicCycleSchoolGroupId: z.string().uuid().optional(),
  scholarshipId: z.string().uuid().optional(),
});

export const academicCycleEnrollmentPagedQuerySchema =
  academicCycleEnrollmentFiltersSchema.extend({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  });

// ─── Body Schemas ───────────────────────────────────────────────────────────

/** Validates POST body for creating an academic cycle enrollment */
export const createAcademicCycleEnrollmentSchema = z
  .object({
    status: statusEnum.optional(),
    observations: z.string().max(1000).optional(),
    droppedNotes: z.string().max(1000).optional(),
    studentId: z.string().uuid({ message: "studentId must be a valid UUID" }),
    academicCycleSchoolGroupId: z
      .string()
      .uuid({ message: "academicCycleSchoolGroupId must be a valid UUID" }),
    scholarshipId: z.string().uuid().optional(),
  })
  .refine((data) => data.status !== "dropped" || !!data.droppedNotes, {
    message: "droppedNotes is required when status is dropped",
    path: ["droppedNotes"],
  });

/** Validates PATCH body for updating an academic cycle enrollment */
export const updateAcademicCycleEnrollmentSchema = z
  .object({
    status: statusEnum.optional(),
    observations: z.string().max(1000).nullable().optional(),
    droppedNotes: z.string().max(1000).nullable().optional(),
    academicCycleSchoolGroupId: z.string().uuid().optional(),
    scholarshipId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  })
  .refine((data) => data.status !== "dropped" || !!data.droppedNotes, {
    message: "droppedNotes is required when status is dropped",
    path: ["droppedNotes"],
  });
