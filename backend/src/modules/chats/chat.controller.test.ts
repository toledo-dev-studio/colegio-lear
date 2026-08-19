import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for the chat controller — covers the studentId-in-URL ownership
 * guard (the one piece of logic that lives in the controller rather than
 * ChatService) and correct delegation for all three handlers.
 */

vi.mock("../../shared/lib/prisma", () => ({ prisma: {} }));

const { findAllChatsMock, findMessagesMock, sendMessageMock } = vi.hoisted(() => ({
  findAllChatsMock: vi.fn(),
  findMessagesMock: vi.fn(),
  sendMessageMock: vi.fn(),
}));
vi.mock("./chat.service", () => ({
  ChatService: vi.fn().mockImplementation(function () {
    return {
      findAllChats: findAllChatsMock,
      findMessages: findMessagesMock,
      sendMessage: sendMessageMock,
    };
  }),
}));

import { findAllChats, findMessages, sendMessage } from "./chat.controller";

const STUDENT_ID = "student-uuid";
const ENROLLMENT_ID = "enrollment-uuid";
const TEACHER_ID = "teacher-uuid";

function buildReqRes(overrides: Record<string, unknown> = {}) {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: {
      studentId: STUDENT_ID,
      enrollmentId: ENROLLMENT_ID,
      teacherId: TEACHER_ID,
    },
    query: {},
    body: {},
    ...overrides,
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  return { req, res };
}

describe("chat controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAllChats", () => {
    it("throws NotFoundError when the URL studentId doesn't match the session", async () => {
      const { req, res } = buildReqRes({ params: { studentId: "someone-else" } });

      await expect(findAllChats(req, res)).rejects.toThrow(NotFoundError);
      expect(findAllChatsMock).not.toHaveBeenCalled();
    });

    it("delegates to ChatService.findAllChats and returns its data", async () => {
      const chats = [{ enrollmentId: ENROLLMENT_ID }];
      findAllChatsMock.mockResolvedValue(chats);
      const { req, res } = buildReqRes();

      await findAllChats(req, res);

      expect(findAllChatsMock).toHaveBeenCalledWith(STUDENT_ID, ENROLLMENT_ID);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(chats);
    });
  });

  describe("findMessages", () => {
    it("throws NotFoundError when the URL studentId doesn't match the session", async () => {
      const { req, res } = buildReqRes({ params: { studentId: "someone-else" } });

      await expect(findMessages(req, res)).rejects.toThrow(NotFoundError);
      expect(findMessagesMock).not.toHaveBeenCalled();
    });

    it("delegates to ChatService.findMessages with page/pageSize from the query", async () => {
      const paged = { data: [], totalPages: 0, currentPage: 1, itemsCount: 0 };
      findMessagesMock.mockResolvedValue(paged);
      const { req, res } = buildReqRes({ query: { page: 1, pageSize: 20 } });

      await findMessages(req, res);

      expect(findMessagesMock).toHaveBeenCalledWith(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, {
        page: 1,
        pageSize: 20,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(paged);
    });
  });

  describe("sendMessage", () => {
    it("throws NotFoundError when the URL studentId doesn't match the session", async () => {
      const { req, res } = buildReqRes({ params: { studentId: "someone-else" } });

      await expect(sendMessage(req, res)).rejects.toThrow(NotFoundError);
      expect(sendMessageMock).not.toHaveBeenCalled();
    });

    it("delegates to ChatService.sendMessage and returns 201", async () => {
      const created = { id: "msg-1", chatId: TEACHER_ID, sentBy: "student", content: "hola", sentAt: "now" };
      sendMessageMock.mockResolvedValue(created);
      const { req, res } = buildReqRes({ body: { content: "hola" } });

      await sendMessage(req, res);

      expect(sendMessageMock).toHaveBeenCalledWith(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, "hola");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });
});
