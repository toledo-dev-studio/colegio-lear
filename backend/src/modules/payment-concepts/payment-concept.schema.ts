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
    .refine((val) => val.length >= 1, { message: "Must not be blank" })
    .refine((val) => val.length <= maxLength, {
      message: `Must be at most ${maxLength} characters`,
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
  id: z.string().uuid({ message: "id must be a valid UUID" }),
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
 *       name: status
 *       schema:
 *         type: string
 *         enum: [true, false]
 *       description: Filter by active/inactive status
 *     PaymentConceptFilterAllowRemission:
 *       in: query
 *       name: allowRemission
 *       schema:
 *         type: string
 *         enum: [true, false]
 *       description: Filter by whether remission is allowed
 *     PaymentConceptFilterBaseAmount:
 *       in: query
 *       name: baseAmount
 *       schema:
 *         type: number
 *         minimum: 0.01
 *         maximum: 999999.99
 *       description: Filter by exact base amount
 *     PaymentConceptFilterMinAmount:
 *       in: query
 *       name: minAmount
 *       schema:
 *         type: number
 *         minimum: 0.01
 *         maximum: 999999.99
 *       description: Filter by minimum base amount (inclusive)
 *     PaymentConceptFilterMaxAmount:
 *       in: query
 *       name: maxAmount
 *       schema:
 *         type: number
 *         minimum: 0.01
 *         maximum: 999999.99
 *       description: Filter by maximum base amount (inclusive)
 */
export const paymentConceptFiltersSchema = z.object({
  q: z.string().max(100, "q must be at most 100 characters").optional(),
  name: z.string().max(100, "name must be at most 100 characters").optional(),
  status: z.enum(["true", "false"]).optional(),
  allowRemission: z.enum(["true", "false"]).optional(),
  baseAmount: z.coerce
    .number({ message: "baseAmount must be a number" })
    .min(0.01, "baseAmount must be at least 0.01")
    .max(999999.99, "baseAmount must be at most 999999.99")
    .optional(),
  minAmount: z.coerce
    .number({ message: "minAmount must be a number" })
    .min(0.01, "minAmount must be at least 0.01")
    .max(999999.99, "minAmount must be at most 999999.99")
    .optional(),
  maxAmount: z.coerce
    .number({ message: "maxAmount must be a number" })
    .min(0.01, "maxAmount must be at least 0.01")
    .max(999999.99, "maxAmount must be at most 999999.99")
    .optional(),
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
      .number({ message: "page must be a number" })
      .int({ message: "page must be an integer" })
      .positive({ message: "page must be a positive integer" })
      .default(1),
    pageSize: z.coerce
      .number({ message: "pageSize must be a number" })
      .int({ message: "pageSize must be an integer" })
      .positive({ message: "pageSize must be a positive integer" })
      .max(100, "pageSize must be at most 100")
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
 *         - description
 *         - baseAmount
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Payment concept name (trimmed, non-blank)
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Payment concept description (trimmed, non-blank)
 *         baseAmount:
 *           type: number
 *           minimum: 0.01
 *           maximum: 999999.99
 *           description: Base amount in MXN (0.01-999999.99)
 *         allowRemission:
 *           type: boolean
 *           default: false
 *           description: Whether the concept allows remission (waiver)
 */
export const createPaymentConceptSchema = z.object({
  name: nonBlankString(100),
  description: nonBlankString(500).optional(),
  baseAmount: z
    .number({ message: "baseAmount must be a number" })
    .min(0.01, "baseAmount must be at least 0.01")
    .max(999999.99, "baseAmount must be at most 999999.99"),
  allowRemission: z
    .boolean({ message: "allowRemission must be a boolean" })
    .default(false),
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
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Payment concept description (trimmed, non-blank)
 *         baseAmount:
 *           type: number
 *           minimum: 0.01
 *           maximum: 999999.99
 *           description: Base amount in MXN (0.01-999999.99)
 *         allowRemission:
 *           type: boolean
 *           description: Whether the concept allows remission (waiver)
 */
export const updatePaymentConceptSchema = z
  .object({
    name: nonBlankString(100).optional(),
    description: nonBlankString(500).optional(),
    baseAmount: z
      .number({ message: "baseAmount must be a number" })
      .min(0.01, "baseAmount must be at least 0.01")
      .max(999999.99, "baseAmount must be at most 999999.99")
      .optional(),
    allowRemission: z
      .boolean({ message: "allowRemission must be a boolean" })
      .optional(),
    status: z.boolean({ message: "status must be a boolean" }).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });
