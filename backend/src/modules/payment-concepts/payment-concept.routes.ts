import { Router } from "express";
import { validate } from "../../shared/middleware/validate.middleware";
import { authorize } from "../../shared/middleware/rbac.middleware";
import {
  idParamSchema,
  paymentConceptFiltersSchema,
  paymentConceptPagedQuerySchema,
  createPaymentConceptSchema,
  updatePaymentConceptSchema,
} from "./payment-concept.schema";
import {
  findAll,
  findAllPaged,
  findById,
  create,
  update,
  softDelete,
} from "./payment-concept.controller";

const router = Router();

/**
 * @openapi
 * /payment-concepts:
 *   get:
 *     tags:
 *       - Payment Concepts
 *     summary: List all payment concepts
 *     description: Returns all payment concepts with optional filters (q, name, isActive, allowForgiveness, amount).
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentConceptFilterQ'
 *       - $ref: '#/components/parameters/PaymentConceptFilterName'
 *       - $ref: '#/components/parameters/PaymentConceptFilterStatus'
 *       - $ref: '#/components/parameters/PaymentConceptFilterAllowForgiveness'
 *       - $ref: '#/components/parameters/PaymentConceptFilterAmount'
 *     responses:
 *       200:
 *         description: List of payment concepts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentConceptRecord'
 *       400:
 *         description: Validation error
 */
router.get(
  "/",
  authorize("payment-concepts"),
  validate(paymentConceptFiltersSchema, "query"),
  findAll,
);

/**
 * @openapi
 * /payment-concepts/paged:
 *   get:
 *     tags:
 *       - Payment Concepts
 *     summary: List payment concepts with pagination
 *     description: Returns a paginated list of payment concepts with optional filters.
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentConceptFilterQ'
 *       - $ref: '#/components/parameters/PaymentConceptFilterName'
 *       - $ref: '#/components/parameters/PaymentConceptFilterStatus'
 *       - $ref: '#/components/parameters/PaymentConceptFilterAllowForgiveness'
 *       - $ref: '#/components/parameters/PaymentConceptFilterAmount'
 *       - $ref: '#/components/parameters/PaymentConceptPageParam'
 *       - $ref: '#/components/parameters/PaymentConceptPageSizeParam'
 *     responses:
 *       200:
 *         description: Paginated list of payment concepts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PaymentConceptRecord'
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 itemsCount:
 *                   type: integer
 *                   example: 25
 *       400:
 *         description: Validation error
 */
router.get(
  "/paged",
  authorize("payment-concepts"),
  validate(paymentConceptPagedQuerySchema, "query"),
  findAllPaged,
);

/**
 * @openapi
 * /payment-concepts/{id}:
 *   get:
 *     tags:
 *       - Payment Concepts
 *     summary: Get a payment concept by ID
 *     description: Returns a single payment concept by its UUID.
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentConceptIdParam'
 *     responses:
 *       200:
 *         description: Payment concept found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentConceptRecord'
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Payment concept not found
 */
router.get(
  "/:id",
  authorize("payment-concepts"),
  validate(idParamSchema, "params"),
  findById,
);

/**
 * @openapi
 * /payment-concepts:
 *   post:
 *     tags:
 *       - Payment Concepts
 *     summary: Create a new payment concept
 *     description: Creates a new payment concept. Validates uniqueness of name (case-insensitive).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentConceptBody'
 *     responses:
 *       201:
 *         description: Payment concept created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentConceptRecord'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate payment concept name
 */
router.post(
  "/",
  authorize("payment-concepts"),
  validate(createPaymentConceptSchema, "body"),
  create,
);

/**
 * @openapi
 * /payment-concepts/{id}:
 *   patch:
 *     tags:
 *       - Payment Concepts
 *     summary: Update a payment concept
 *     description: Partially updates a payment concept. At least one field must be provided.
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentConceptIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePaymentConceptBody'
 *     responses:
 *       200:
 *         description: Payment concept updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentConceptRecord'
 *       400:
 *         description: Validation error or empty body
 *       404:
 *         description: Payment concept not found
 *       409:
 *         description: Duplicate payment concept name
 */
router.patch(
  "/:id",
  authorize("payment-concepts"),
  validate(idParamSchema, "params"),
  validate(updatePaymentConceptSchema, "body"),
  update,
);

/**
 * @openapi
 * /payment-concepts/{id}:
 *   delete:
 *     tags:
 *       - Payment Concepts
 *     summary: Soft delete a payment concept
 *     description: Sets the payment concept isDeleted flag to true (soft delete).
 *     parameters:
 *       - $ref: '#/components/parameters/PaymentConceptIdParam'
 *     responses:
 *       204:
 *         description: Eliminado correctamente (No Content)
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Payment concept not found
 *       409:
 *         description: Payment concept is already inactive
 */
router.delete(
  "/:id",
  authorize("payment-concepts"),
  validate(idParamSchema, "params"),
  softDelete,
);

export default router;
