import { z } from "zod";

const schoolGroupStatusEnum = z.enum(["active", "discharged"]);

const academicCycleStatusEnum = z.enum([
  "upcoming",
  "active",
  "completed",
  "cancelled",
  "archived",
]);

/** Validates GET /me/school-groups/paged query params */
export const myClassPagedQuerySchema = z.object({
  q: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
  status: schoolGroupStatusEnum.optional(),
  academicCycleStatus: academicCycleStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

/** Validates the :id path param of GET /me/school-groups/:id */
export const myClassIdParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});
