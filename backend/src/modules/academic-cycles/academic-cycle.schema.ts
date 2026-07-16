import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

function nonBlankString(maxLength: number) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, { message: "Must not be blank" })
    .refine((val) => val.length <= maxLength, {
      message: `Must be at most ${maxLength} characters`,
    });
}

// ─── Enums ──────────────────────────────────────────────────────────────────

const academicPeriodTypeEnum = z.enum([
  "annual",
  "semester",
  "four-month-period",
  "trimester",
  "bimester",
  "monthly",
  "intensive",
  "special",
]);

const academicCycleStatusEnum = z.enum([
  "upcoming",
  "active",
  "completed",
  "cancelled",
  "archived",
]);

// ─── Param Schemas ──────────────────────────────────────────────────────────

/** Validates UUID path parameter */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

/** Validates academicCycleId path parameter */
export const academicCycleIdParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId must be a valid UUID" }),
});

/** Validates academicCycleId + id path parameters */
export const academicCycleSubResourceParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId must be a valid UUID" }),
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});

// ─── Filter Schemas ─────────────────────────────────────────────────────────

/** Validates optional query filters for academic cycle list endpoints */
export const academicCycleFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
  code: z.string().max(50).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  periodType: academicPeriodTypeEnum.optional(),
  enrollmentOpen: z.enum(["true", "false"]).optional(),
  status: academicCycleStatusEnum.optional(),
});

/** Validates paged query (filters + pagination) */
export const academicCyclePagedQuerySchema = academicCycleFiltersSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

// ─── Body Schemas ───────────────────────────────────────────────────────────

const gradeIntField = z.number().int().min(1).max(10);

/** Validates POST body for creating an academic cycle */
export const createAcademicCycleSchema = z.object({
  name: nonBlankString(150),
  code: nonBlankString(50),
  startDate: z
    .string()
    .datetime({ message: "startDate must be a valid ISO date" }),
  endDate: z.string().datetime({ message: "endDate must be a valid ISO date" }),
  periodType: academicPeriodTypeEnum,
  status: academicCycleStatusEnum.optional(),
  minimumPassingGrade: gradeIntField,
  evaluationCount: gradeIntField,
  enrollmentOpen: z.boolean().optional(),
  description: z.string().max(500).optional(),
  observations: z.string().max(1000).optional(),
  academicLevelId: z
    .string()
    .uuid({ message: "academicLevelId must be a valid UUID" }),
  educationLevelId: z
    .string()
    .uuid({ message: "educationLevelId must be a valid UUID" }),
});

/** Validates PATCH body for updating an academic cycle */
export const updateAcademicCycleSchema = z
  .object({
    name: nonBlankString(150).optional(),
    code: nonBlankString(50).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    periodType: academicPeriodTypeEnum.optional(),
    status: academicCycleStatusEnum.optional(),
    minimumPassingGrade: gradeIntField.optional(),
    evaluationCount: gradeIntField.optional(),
    enrollmentOpen: z.boolean().optional(),
    description: z.string().max(500).nullable().optional(),
    observations: z.string().max(1000).nullable().optional(),
    academicLevelId: z.string().uuid().optional(),
    educationLevelId: z.string().uuid().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });
