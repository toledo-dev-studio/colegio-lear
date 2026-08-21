import { z } from "zod";

// ─── Enums ──────────────────────────────────────────────────────────────────

const statusEnum = z.enum(["enrolled", "completed", "dropped"]);

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Optional UUID: blank string, whitespace-only, or null are all treated as
 * "not provided" (-> undefined). Without this, a client sending "" for an
 * unselected dropdown (instead of omitting the key) fails `.uuid()`
 * validation even though the field is meant to be optional.
 */
function optionalUuid(message: string) {
  return z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return undefined;
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .pipe(z.string().uuid({ message }).optional());
}

/**
 * Optional, nullable UUID for PATCH bodies: blank string or explicit null
 * both mean "clear this field" (-> null, written to the DB); omitting the
 * key entirely (-> undefined) means "don't touch it".
 */
function optionalNullableUuid(message: string) {
  return z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      const trimmed = val.trim();
      return trimmed === "" ? null : trimmed;
    })
    .pipe(z.string().uuid({ message }).nullable().optional());
}

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
  scholarshipId: optionalUuid("scholarshipId must be a valid UUID"),
});

export const academicCycleEnrollmentPagedQuerySchema =
  academicCycleEnrollmentFiltersSchema.extend({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  });

/**
 * Validates GET /academic-cycles/:academicCycleId/enrollments (non-paged)
 * query — unlike the paged listing above, academicCycleSchoolGroupId is
 * required here: this endpoint returns every matching enrollment with no
 * limit, so it must always be scoped to a single group (used by "my
 * classes" to populate its student roster for chats/grades).
 */
export const academicCycleEnrollmentByGroupQuerySchema = z.object({
  academicCycleSchoolGroupId: z
    .string()
    .uuid({ message: "academicCycleSchoolGroupId must be a valid UUID" }),
  status: statusEnum.optional(),
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
    scholarshipId: optionalUuid("scholarshipId must be a valid UUID"),
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
    scholarshipId: optionalNullableUuid("scholarshipId must be a valid UUID"),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  })
  .refine((data) => data.status !== "dropped" || !!data.droppedNotes, {
    message: "droppedNotes is required when status is dropped",
    path: ["droppedNotes"],
  });
