import { type RequestHandler } from "express";
import { ForbiddenError } from "../errors/app-error";
import type { ModuleKey } from "../../modules/security-roles/security-role.types";

/**
 * HTTP method → permission field mapping.
 * GET requires canRead; POST/PATCH/PUT require canWrite; DELETE requires canDelete.
 */
const METHOD_PERMISSION_MAP: Record<
  string,
  "canRead" | "canWrite" | "canDelete"
> = {
  GET: "canRead",
  POST: "canWrite",
  PATCH: "canWrite",
  PUT: "canWrite",
  DELETE: "canDelete",
};

/**
 * Factory that returns middleware enforcing module-level RBAC.
 *
 * Reads req.user.permissions (loaded by authenticate middleware) and checks
 * whether the employee's security role grants the required permission for the
 * given moduleKey, derived from the HTTP method:
 *   - GET    → canRead
 *   - POST   → canWrite
 *   - PATCH / PUT → canWrite
 *   - DELETE → canDelete
 *
 * Returns 403 if the permission entry is missing or the flag is false.
 * Must be placed after the authenticate middleware in the middleware chain.
 *
 * @param moduleKey - The module identifier matching a SecurityRolePermission.moduleKey
 *
 * @example
 * router.get("/", authorize("students"), findAll);
 * router.post("/", authorize("students"), validate(schema, "body"), create);
 */
export function authorize(moduleKey: ModuleKey): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ForbiddenError("Insufficient privileges");
    }

    const requiredPermission = METHOD_PERMISSION_MAP[req.method];

    // Unsupported HTTP method — deny by default
    if (!requiredPermission) {
      throw new ForbiddenError("Insufficient privileges");
    }

    // Find the permission entry for this module in the employee's role
    const permission = req.user.permissions.find(
      (p) => p.moduleKey === moduleKey,
    );

    // No entry for this module or the required flag is false → 403
    if (!permission || !permission[requiredPermission]) {
      throw new ForbiddenError("Insufficient privileges");
    }

    next();
  };
}
