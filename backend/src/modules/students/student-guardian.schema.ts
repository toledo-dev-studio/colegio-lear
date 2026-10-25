import { z } from "zod";

const GUARDIAN_TYPES = [
  "father",
  "mother",
  "grandmother",
  "grandfather",
  "uncle",
  "aunt",
  "brother",
  "sister",
  "legal-guardian",
  "step-father",
  "step-mother",
  "other",
] as const;

/**
 * Optional string: null/blank become undefined; otherwise trimmed and
 * capped at maxLength. Used for fields only required for the principal
 * guardian (phoneNumber/email).
 */
function optionalTrimmedString(maxLength: number) {
  return z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return undefined;
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .pipe(
      z.string().max(maxLength, `Debe tener como máximo ${maxLength} caracteres`).optional(),
    );
}

/** Same as optionalTrimmedString, but validates email format when present. */
function optionalEmail(maxLength: number) {
  return z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return undefined;
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .pipe(
      z
        .string()
        .email("Debe ser un correo electrónico válido")
        .max(maxLength, `Debe tener como máximo ${maxLength} caracteres`)
        .optional(),
    );
}

/**
 * Optional string for PATCH bodies: blank string or explicit null both mean
 * "clear this field" (-> null, written to the DB); omitting the key
 * entirely (-> undefined) means "don't touch it". Using optionalTrimmedString
 * here instead would silently drop the update whenever a client clears the
 * field by sending "" (e.g. blanking phoneNumber/email after unchecking
 * isPrincipal) — the value would never reach updateData.
 */
function optionalNullableTrimmedString(maxLength: number) {
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
    .pipe(
      z
        .string()
        .max(maxLength, `Debe tener como máximo ${maxLength} caracteres`)
        .nullable()
        .optional(),
    );
}

/** Same as optionalNullableTrimmedString, but validates email format when present. */
function optionalNullableEmail(maxLength: number) {
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
    .pipe(
      z
        .string()
        .email("Debe ser un correo electrónico válido")
        .max(maxLength, `Debe tener como máximo ${maxLength} caracteres`)
        .nullable()
        .optional(),
    );
}

/**
 * Validates POST body for creating a student guardian.
 * phoneNumber/email are only required when isPrincipal is true — for any
 * other guardian they may be omitted/null.
 */
export const createStudentGuardianSchema = z
  .object({
    fullName: z.string().min(1).max(200),
    relationship: z.enum(GUARDIAN_TYPES),
    phoneNumber: optionalTrimmedString(20),
    email: optionalEmail(150),
    isPrincipal: z.boolean().default(false),
    emergencyContact: z.boolean().default(false),
    authorizedToPickUp: z.boolean().default(false),
    observations: z.string().max(500).optional(),
  })
  .refine((data) => !data.isPrincipal || !!data.phoneNumber, {
    message: "phoneNumber es requerido cuando isPrincipal es true",
    path: ["phoneNumber"],
  })
  .refine((data) => !data.isPrincipal || !!data.email, {
    message: "email es requerido cuando isPrincipal es true",
    path: ["email"],
  });

/**
 * Validates PATCH body for updating a student guardian.
 * Note: since this is a partial update, whether the *resulting* record
 * satisfies "phoneNumber/email required when isPrincipal=true" can only be
 * checked once merged with the existing record — that check happens in
 * StudentGuardianService.update, not here.
 */
export const updateStudentGuardianSchema = z
  .object({
    fullName: z.string().min(1).max(200).optional(),
    relationship: z.enum(GUARDIAN_TYPES).optional(),
    phoneNumber: optionalNullableTrimmedString(20),
    email: optionalNullableEmail(150),
    isPrincipal: z.boolean().optional(),
    emergencyContact: z.boolean().optional(),
    authorizedToPickUp: z.boolean().optional(),
    observations: z.string().max(500).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Se requiere al menos un campo",
  });
