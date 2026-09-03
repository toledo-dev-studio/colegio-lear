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

/** Blood type values, matching the frontend's BloodTypeKey format exactly. */
const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

// ─── Schemas ────────────────────────────────────────────────────────────────

/** Validates UUID path parameter */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/** Validates studentId path parameter */
export const studentIdParamSchema = z.object({
  studentId: z.string().uuid({ message: "studentId debe ser un UUID válido" }),
});

/** Validates studentId + id path parameters */
export const studentSubResourceParamSchema = z.object({
  studentId: z.string().uuid({ message: "studentId debe ser un UUID válido" }),
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/** Validates optional query filters for student list endpoints */
export const studentFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  fullName: z.string().max(100).optional(),
  curp: z.string().max(18).optional(),
  enrollment: z.string().max(20).optional(),
  email: z.string().max(150).optional(),
  phoneNumber: z.string().max(20).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

/** Validates paged query (filters + pagination) */
export const studentPagedQuerySchema = studentFiltersSchema.extend({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

/** Validates POST body for creating a student */
export const createStudentSchema = z.object({
  name: nonBlankString(100),
  firstLastName: nonBlankString(100),
  secondLastName: nonBlankString(100),
  dateOfBirth: z
    .string()
    .datetime({ message: "dateOfBirth debe ser una fecha ISO válida" }),
  curp: nonBlankString(18),
  avatar: z.string().max(500).optional(),
  observations: z.string().max(1000).optional(),
  bloodType: z.enum(BLOOD_TYPES, {
    error: `bloodType debe ser uno de: ${BLOOD_TYPES.join(", ")}`,
  }),
  medicalNotes: z.string().max(1000).optional(),
  email: z.string().email("email debe ser un correo electrónico válido").max(150),
  phoneNumber: nonBlankString(20),
  address: nonBlankString(300),
  state: nonBlankString(100),
  municipality: nonBlankString(100),
  postalCode: nonBlankString(10),
  isActive: z.boolean().optional(),
});

/** Validates PATCH body for updating a student */
export const updateStudentSchema = z
  .object({
    name: nonBlankString(100).optional(),
    firstLastName: nonBlankString(100).optional(),
    secondLastName: nonBlankString(100).optional(),
    dateOfBirth: z.string().datetime().optional(),
    curp: nonBlankString(18).optional(),
    avatar: z.string().max(500).nullable().optional(),
    observations: z.string().max(1000).nullable().optional(),
    bloodType: z.enum(BLOOD_TYPES).optional(),
    medicalNotes: z.string().max(1000).nullable().optional(),
    email: z.string().email().max(150).optional(),
    phoneNumber: nonBlankString(20).optional(),
    address: nonBlankString(300).optional(),
    state: nonBlankString(100).optional(),
    municipality: nonBlankString(100).optional(),
    postalCode: nonBlankString(10).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  });
