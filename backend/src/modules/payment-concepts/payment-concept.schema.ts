import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Trims the string and ensures it is not blank (whitespace-only).
 * Used for name and description fields.
 */
function nonBlankString(maxLength: number) {
  return z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, { message: "No debe estar en blanco" })
    .refine((val) => val.length <= maxLength, {
      message: `Debe tener como máximo ${maxLength} caracteres`,
    });
}

/**
 * Internal control code: trimmed, uppercased, 1-10 chars, letters/digits only.
 * Uniqueness is enforced in the service, not here.
 */
function codeField() {
  return z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val.length >= 1, { message: "No debe estar en blanco" })
    .refine((val) => val.length <= 10, {
      message: "Debe tener como máximo 10 caracteres",
    })
    .refine((val) => /^[A-Z0-9]+$/.test(val), {
      message: "Debe contener solo letras y números",
    });
}

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Validates UUID path parameter.
 *
 * @swagger
 * components:
 *   parameters:
 *     PaymentConceptIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 *       description: UUID of the payment concept
 */
export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id debe ser un UUID válido" }),
});

/**
 * Validates optional query filters for payment concept list endpoints.
 *
 * @swagger
 * components:
 *   parameters:
 *     PaymentConceptFilterQ:
 *       in: query
 *       name: q
 *       schema:
 *         type: string
 *         maxLength: 100
 *       description: Free-text search on name and description (case-insensitive)
 *     PaymentConceptFilterName:
 *       in: query
 *       name: name
 *       schema:
 *         type: string
 *         maxLength: 100
 *       description: Filter by payment concept name (case-insensitive contains)
 *     PaymentConceptFilterStatus:
 *       in: query
 *       name: isActive
 *       schema:
 *         type: string
 *         enum: [true, false]
 *       description: Filter by active/inactive status
 *     PaymentConceptFilterAllowForgiveness:
 *       in: query
 *       name: allowForgiveness
 *       schema:
 *         type: string
 *         enum: [true, false]
 *       description: Filter by whether forgiveness is allowed
 *     PaymentConceptFilterAmount:
 *       in: query
 *       name: amount
 *       schema:
 *         type: number
 *         minimum: 0.01
 *       description: Filter by maximum amount (matches concepts at or below this value)
 */
export const paymentConceptFiltersSchema = z.object({
  q: z.string().max(100, "q debe tener como máximo 100 caracteres").optional(),
  name: z.string().max(100, "name debe tener como máximo 100 caracteres").optional(),
  isActive: z.enum(["true", "false"]).optional(),
  allowForgiveness: z.enum(["true", "false"]).optional(),
  amount: z.coerce
    .number({ message: "amount debe ser un número" })
    .min(0)
    .optional()
    .transform((val) => (val === 0 ? undefined : val)),
});

/**
 * Validates query for the payment concepts paged endpoint.
 * Extends paymentConceptFiltersSchema with pagination parameters.
 * Query string values arrive as strings, so page and pageSize use z.coerce.number().
 *
 * @swagger
 * components:
 *   parameters:
 *     PaymentConceptPageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number (positive integer, defaults to 1)
 *     PaymentConceptPageSizeParam:
 *       in: query
 *       name: pageSize
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Items per page (positive integer, max 100, defaults to 10)
 */
export const paymentConceptPagedQuerySchema =
  paymentConceptFiltersSchema.extend({
    page: z.coerce
      .number({ message: "page debe ser un número" })
      .int({ message: "page debe ser un número entero" })
      .positive({ message: "page debe ser un entero positivo" })
      .default(1),
    pageSize: z.coerce
      .number({ message: "pageSize debe ser un número" })
      .int({ message: "pageSize debe ser un número entero" })
      .positive({ message: "pageSize debe ser un entero positivo" })
      .max(100, "pageSize debe ser como máximo 100")
      .default(10),
  });

/**
 * Validates POST body for creating a payment concept.
 *
 * @swagger
 * components:
 *   schemas:
 *     CreatePaymentConceptBody:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - amount
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Payment concept name (trimmed, non-blank)
 *         code:
 *           type: string
 *           minLength: 1
 *           maxLength: 10
 *           description: Internal control code, unique, letters/digits only (auto-uppercased)
 *           example: "INSCRIP"
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Payment concept description (trimmed, non-blank)
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           maximum: 999999.99
 *           description: Amount in MXN (0.01-999999.99)
 *         allowForgiveness:
 *           type: boolean
 *           default: false
 *           description: Whether the concept allows forgiveness (waiver)
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the payment concept is active
 */
export const createPaymentConceptSchema = z.object({
  name: nonBlankString(100),
  code: codeField(),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (val === null || val === undefined) return undefined;
      const trimmed = val.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .pipe(z.string().max(500, "Debe tener como máximo 500 caracteres").optional()),
  amount: z
    .number({ message: "amount debe ser un número" })
    .min(0.01, "amount debe ser al menos 0.01")
    .max(999999.99, "amount debe ser como máximo 999999.99"),
  allowForgiveness: z
    .boolean({ message: "allowForgiveness debe ser un booleano" })
    .default(false),
  isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
});

/**
 * Validates PATCH body for updating a payment concept.
 * All fields are optional but at least one must be provided.
 *
 * @swagger
 * components:
 *   schemas:
 *     UpdatePaymentConceptBody:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Payment concept name (trimmed, non-blank)
 *         code:
 *           type: string
 *           minLength: 1
 *           maxLength: 10
 *           description: Internal control code, unique, letters/digits only (auto-uppercased)
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Payment concept description (trimmed, non-blank)
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           maximum: 999999.99
 *           description: Amount in MXN (0.01-999999.99)
 *         allowForgiveness:
 *           type: boolean
 *           description: Whether the concept allows forgiveness (waiver)
 *         isActive:
 *           type: boolean
 *           description: Whether the payment concept is active
 */
export const updatePaymentConceptSchema = z
  .object({
    name: nonBlankString(100).optional(),
    code: codeField().optional(),
    description: z
      .string()
      .nullable()
      .optional()
      .transform((val) => {
        if (val === null || val === undefined) return undefined;
        const trimmed = val.trim();
        return trimmed === "" ? undefined : trimmed;
      })
      .pipe(z.string().max(500, "Debe tener como máximo 500 caracteres").optional()),
    amount: z
      .number({ message: "amount debe ser un número" })
      .min(0.01, "amount debe ser al menos 0.01")
      .max(999999.99, "amount debe ser como máximo 999999.99")
      .optional(),
    allowForgiveness: z
      .boolean({ message: "allowForgiveness debe ser un booleano" })
      .optional(),
    isActive: z.boolean({ message: "isActive debe ser un booleano" }).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se requiere al menos un campo",
  });
