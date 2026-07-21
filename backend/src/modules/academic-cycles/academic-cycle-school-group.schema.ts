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

const HH_MM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeString() {
  return z.string().regex(HH_MM_REGEX, { message: "Must be a valid HH:mm time" });
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
    .uuid({ message: "academicCycleId must be a valid UUID" }),
  academicCycleSchoolGroupId: z
    .string()
    .uuid({ message: "academicCycleSchoolGroupId must be a valid UUID" }),
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
      .uuid({ message: "schoolSubjectId must be a valid UUID" }),
    teacherId: z.string().uuid({ message: "teacherId must be a valid UUID" }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
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
      message: "dischargedDescription is required when status is discharged",
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
    message: "At least one field is required",
  })
  .refine(
    (data) => data.status !== "discharged" || !!data.dischargedDescription,
    {
      message: "dischargedDescription is required when status is discharged",
      path: ["dischargedDescription"],
    },
  );
