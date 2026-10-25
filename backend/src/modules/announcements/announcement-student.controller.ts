import { Request, Response, NextFunction } from "express";
import { AnnouncementService } from "./announcement.service";
import { idParamSchema } from "./announcement.schema";
import { prisma } from "../../shared/lib/prisma";
import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { sendSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Student-portal handler for the "shared URL" announcement-detail endpoint
 * (GET /announcements/:id). Sole Express handler for its route (see
 * gate-student-session.middleware.ts for why chaining more middleware after
 * the gate would break the fallthrough to the employee router) — does the
 * gate check, param validation, ownership check, and response all inline,
 * then delegates the actual data-shaping to AnnouncementService, the same
 * service the employee-facing controller uses.
 */

const service = new AnnouncementService(prisma);

function parseParams(req: Request): { id: string } {
  const result = idParamSchema.safeParse(req.params);
  if (!result.success) {
    throw new ValidationError(
      "Error de validación",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

/**
 * Verifies the requesting student actually was sent this announcement —
 * i.e. a "student" notification row pointing at it exists for them — before
 * letting the real query run. 404 (not 403) on mismatch, same posture as
 * every other student-portal ownership check in this codebase.
 */
async function assertStudentWasSentAnnouncement(
  studentId: string,
  announcementId: string,
): Promise<void> {
  const notification = await prisma.notification.findFirst({
    where: {
      studentId,
      relatedRecordId: announcementId,
      type: "announcement",
      recipientType: "student",
    },
    select: { id: true },
  });

  if (!notification) {
    throw new NotFoundError("Comunicado no encontrado");
  }
}

/** GET /announcements/:id */
export async function getByIdStudent(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const isStudent = await gateStudentSession(req, res, next);
  if (!isStudent) return;

  const { id } = parseParams(req);
  await assertStudentWasSentAnnouncement(req.student!.studentId, id);

  const data = await service.findById(id);
  sendSuccess(res, data);
}
