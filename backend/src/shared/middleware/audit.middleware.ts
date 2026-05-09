import { type RequestHandler } from "express";
import { createAuditLog } from "../../modules/audit/audit.service";
import { logger } from "../lib/logger";

/**
 * Factory that returns middleware logging the action after the response is sent.
 * Fire-and-forget: failures are logged via Application Logger, never block the response.
 *
 * @param action   - The action being performed (e.g. "create", "update", "delete")
 * @param resource - The target resource name (e.g. "employees", "profiles")
 */
export function auditLog(action: string, resource: string): RequestHandler {
  return (req, res, next) => {
    res.on("finish", () => {
      const employeeId = req.user?.employeeId;
      if (!employeeId) {
        return;
      }

      const resourceId =
        typeof req.params.id === "string" ? req.params.id : undefined;

      // Fire-and-forget — do NOT await, catch errors internally
      createAuditLog({
        employeeId,
        action,
        resource,
        ...(resourceId !== undefined ? { resourceId } : {}),
      }).catch((error) => {
        logger.error("Audit middleware failed to log action", {
          error,
          action,
          resource,
          employeeId,
        });
      });
    });

    // Call next immediately — do not wait for the finish event
    next();
  };
}
