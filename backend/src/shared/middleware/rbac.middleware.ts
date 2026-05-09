import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { ForbiddenError } from "../errors/app-error";

/**
 * Factory that returns middleware verifying whether the authenticated user's
 * profile has the required privilege for the given module and action.
 * Returns 403 if the privilege is missing.
 */
export function authorize(
  moduleName: string,
  action: "create" | "read" | "update" | "delete",
): RequestHandler {
  return async (req, _res, next) => {
    const profileId = req.user?.profileId;

    if (!req.user || profileId == null) {
      throw new ForbiddenError("Insufficient privileges");
    }

    const privilege = await prisma.privilege.findFirst({
      where: {
        profileId,
        action,
        moduleReference: {
          name: moduleName,
        },
      },
    });

    if (!privilege) {
      throw new ForbiddenError("Insufficient privileges");
    }

    next();
  };
}
