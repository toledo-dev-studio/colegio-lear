import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError } from "../../shared/errors/app-error";

const service = new ChatService(prisma);

/**
 * The URL carries :studentId even though the session already identifies the
 * student (matches the doc's contract exactly) — this only ever accepts it
 * when it matches the authenticated session. 404 (not 403), same posture as
 * every other ownership check in this codebase: never confirms whether a
 * *different* studentId even exists.
 */
function assertOwnStudentId(req: Request): string {
  const { studentId } = req.params as { studentId: string };
  if (studentId !== req.student!.studentId) {
    throw new NotFoundError("Student not found");
  }
  return studentId;
}

/** GET /students/:studentId/enrollments/:enrollmentId/chats */
export async function findAllChats(req: Request, res: Response): Promise<void> {
  const studentId = assertOwnStudentId(req);
  const { enrollmentId } = req.params as { enrollmentId: string };

  const data = await service.findAllChats(studentId, enrollmentId);
  sendSuccess(res, data);
}

/** GET /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages */
export async function findMessages(req: Request, res: Response): Promise<void> {
  const studentId = assertOwnStudentId(req);
  const { enrollmentId, teacherId } = req.params as {
    enrollmentId: string;
    teacherId: string;
  };
  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  const result = await service.findMessages(studentId, enrollmentId, teacherId, {
    page,
    pageSize,
  });
  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/** POST /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const studentId = assertOwnStudentId(req);
  const { enrollmentId, teacherId } = req.params as {
    enrollmentId: string;
    teacherId: string;
  };
  const { content } = req.body as { content: string };

  const data = await service.sendMessage(studentId, enrollmentId, teacherId, content);
  sendSuccess(res, data, 201);
}
