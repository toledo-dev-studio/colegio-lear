import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

function nonBlankString(maxLength: number) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, { message: "No debe estar en blanco" })
    .refine((val) => val.length <= maxLength, {
      message: `Debe tener como máximo ${maxLength} caracteres`,
    });
}

const HH_MM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeString() {
  return z.string().regex(HH_MM_REGEX, { message: "Debe ser una hora HH:mm válida" });
}

// ─── Enums ──────────────────────────────────────────────────────────────────

const statusEnum = z.enum(["active", "discharged"]);

const dayOfWeekEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// ─── Param Schemas ──────────────────────────────────────────────────────────

/** Validates academicCycleId + academicCycleSchoolGroupId path parameters */
export const academicCycleSchoolGroupIdParamSchema = z.object({
  academicCycleId: z
    .string()
    .uuid({ message: "academicCycleId debe ser un UUID válido" }),
  academicCycleSchoolGroupId: z
    .string()
    .uuid({ message: "academicCycleSchoolGroupId debe ser un UUID válido" }),
});

/** Validates optional query filters for the derived teachers endpoint */
export const academicCycleSchoolGroupTeachersQuerySchema = z.object({
  includeInactive: z.enum(["true", "false"]).optional(),
});

// ─── Calendar Item Schema ───────────────────────────────────────────────────

const calendarItemSchema = z
  .object({
    id: z.string().optional(),
    day: dayOfWeekEnum,
    startTime: timeString(),
    endTime: timeString(),
    schoolSubjectId: z
      .string()
      .uuid({ message: "schoolSubjectId debe ser un UUID válido" }),
    teacherId: z.string().uuid({ message: "teacherId debe ser un UUID válido" }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime debe ser anterior a endTime",
    path: ["endTime"],
  });

// ─── Body Schemas ───────────────────────────────────────────────────────────

/** Validates POST body for creating an academic cycle school group */
export const createAcademicCycleSchoolGroupSchema = z
  .object({
    name: nonBlankString(100),
    status: statusEnum.optional(),
    description: z.string().max(500).optional(),
    dischargedDescription: z.string().max(500).optional(),
    calendars: z.array(calendarItemSchema).optional(),
  })
  .refine(
    (data) => data.status !== "discharged" || !!data.dischargedDescription,
    {
      message: "dischargedDescription es requerido cuando el estado es discharged",
      path: ["dischargedDescription"],
    },
  );

/** Validates PATCH body for updating an academic cycle school group */
export const updateAcademicCycleSchoolGroupSchema = z
  .object({
    name: nonBlankString(100).optional(),
    status: statusEnum.optional(),
    description: z.string().max(500).nullable().optional(),
    dischargedDescription: z.string().max(500).nullable().optional(),
    calendars: z.array(calendarItemSchema).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  })
  .refine(
    (data) => data.status !== "discharged" || !!data.dischargedDescription,
    {
      message: "dischargedDescription es requerido cuando el estado es discharged",
      path: ["dischargedDescription"],
    },
  );
