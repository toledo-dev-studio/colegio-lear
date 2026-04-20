import { type RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../errors/app-error";

/**
 * Factory that returns Express middleware validating req[source]
 * against a Zod schema. On success the parsed (cleaned) data replaces
 * the original value; on failure a ValidationError is thrown with
 * field-level details.
 *
 * @param schema  - Zod schema to validate against
 * @param source  - Request property to validate ("body" | "query" | "params"), defaults to "body"
 */
export function validate(
  schema: z.ZodType,
  source: "body" | "query" | "params" = "body",
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw new ValidationError("Validation failed", details);
    }

    // Replace with parsed/cleaned data
    req[source] = result.data;
    next();
  };
}
