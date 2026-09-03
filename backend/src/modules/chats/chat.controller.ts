import { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { prisma } from "../../shared/lib/prisma";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/helpers/response.helper";
import { NotFoundError } from "../../shared/errors/app-error";
import { resolveChatActor } from "../../shared/middleware/resolve-chat-actor.middleware";

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
    throw new NotFoundError("Alumno no encontrado");
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

/**
 * GET /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages
 * Serves both audiences from this one handler (see resolve-chat-actor.middleware.ts
 * for why there's no fallthrough router here, unlike gate-student-session):
 * a student session must own :studentId, a teacher session must own
 * :teacherId — 404 (not 403) either way, never confirming existence to the
 * wrong party.
 */
export async function findMessages(req: Request, res: Response): Promise<void> {
  const actor = await resolveChatActor(req, res);
  const { studentId, enrollmentId, teacherId } = req.params as {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
  };
  const query = req.query as Record<string, unknown>;
  const page = query.page as number;
  const pageSize = query.pageSize as number;

  let result;
  if (actor.type === "student") {
    if (studentId !== actor.studentId) {
      throw new NotFoundError("Alumno no encontrado");
    }
    result = await service.findMessages(studentId, enrollmentId, teacherId, { page, pageSize });
  } else {
    if (teacherId !== actor.employeeId) {
      throw new NotFoundError("Profesor no encontrado");
    }
    result = await service.findMessagesForTeacher(teacherId, studentId, enrollmentId, {
      page,
      pageSize,
    });
  }

  sendPaginatedSuccess(
    res,
    result.data,
    result.totalPages,
    result.currentPage,
    result.itemsCount,
  );
}

/**
 * POST /students/:studentId/enrollments/:enrollmentId/chats/:teacherId/messages
 * Same dual-actor resolution as findMessages above; `sentBy` on the created
 * message follows from which side sent it (see ChatService.sendMessage /
 * sendMessageForTeacher).
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const actor = await resolveChatActor(req, res);
  const { studentId, enrollmentId, teacherId } = req.params as {
    studentId: string;
    enrollmentId: string;
    teacherId: string;
  };
  const { content } = req.body as { content: string };

  let data;
  if (actor.type === "student") {
    if (studentId !== actor.studentId) {
      throw new NotFoundError("Alumno no encontrado");
    }
    data = await service.sendMessage(studentId, enrollmentId, teacherId, content);
  } else {
    if (teacherId !== actor.employeeId) {
      throw new NotFoundError("Profesor no encontrado");
    }
    data = await service.sendMessageForTeacher(teacherId, studentId, enrollmentId, content);
  }

  sendSuccess(res, data, 201);
}
