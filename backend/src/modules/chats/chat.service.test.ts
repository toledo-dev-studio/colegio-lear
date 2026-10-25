import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError } from "../../shared/errors/app-error";

/**
 * Unit tests for ChatService — covers deriving the conversation list from
 * AcademicCycleSchoolGroupService.findAllTeachers (mocked), the
 * "from the end" message pagination + mark-as-read on page 1, the
 * teacher-ownership guard, and the employee notification created on send.
 */

const { findAllTeachersMock, resolveTeacherGroupScopeMock } = vi.hoisted(() => ({
  findAllTeachersMock: vi.fn(),
  resolveTeacherGroupScopeMock: vi.fn(),
}));
vi.mock("../academic-cycles/academic-cycle-school-group.service", () => ({
  AcademicCycleSchoolGroupService: vi.fn().mockImplementation(function () {
    return { findAllTeachers: findAllTeachersMock };
  }),
}));
vi.mock("../academic-cycles/teacher-class-scope.helper", () => ({
  resolveTeacherGroupScope: resolveTeacherGroupScopeMock,
}));

import { ChatService } from "./chat.service";

function createMockPrisma() {
  return {
    academicCycleEnrollment: { findFirst: vi.fn() },
    studentChatMessage: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    student: { findUnique: vi.fn() },
    employee: { findUnique: vi.fn() },
    notification: { create: vi.fn() },
  };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

const STUDENT_ID = "student-uuid";
const ENROLLMENT_ID = "enrollment-uuid";
const TEACHER_ID = "teacher-uuid";
const CYCLE_ID = "cycle-uuid";
const GROUP_ID = "group-uuid";

const BASE_ENROLLMENT = {
  id: ENROLLMENT_ID,
  studentId: STUDENT_ID,
  academicCycleId: CYCLE_ID,
  academicCycleSchoolGroupId: GROUP_ID,
};

const TEACHER_PAIR = {
  schoolSubjectId: "subject-uuid",
  schoolSubject: { id: "subject-uuid", name: "Matemáticas", description: null },
  teacherId: TEACHER_ID,
  teacher: { id: TEACHER_ID, name: "Ana", firstLastName: "Torres" },
};

describe("ChatService", () => {
  let prisma: MockPrisma;
  let service: ChatService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = createMockPrisma();
    service = new ChatService(prisma as any);
    prisma.academicCycleEnrollment.findFirst.mockResolvedValue(BASE_ENROLLMENT);
    findAllTeachersMock.mockResolvedValue([TEACHER_PAIR]);
    resolveTeacherGroupScopeMock.mockResolvedValue(undefined);
  });

  describe("findAllChats", () => {
    it("throws NotFoundError when the enrollment isn't the student's own", async () => {
      prisma.academicCycleEnrollment.findFirst.mockResolvedValue(null);

      await expect(service.findAllChats(STUDENT_ID, ENROLLMENT_ID)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("builds one conversation per teacher, with last message + unread count", async () => {
      prisma.studentChatMessage.findFirst.mockResolvedValue({
        content: "Hola profe",
        sentAt: new Date("2026-09-10T12:00:00.000Z"),
      });
      prisma.studentChatMessage.count.mockResolvedValue(2);

      const result = await service.findAllChats(STUDENT_ID, ENROLLMENT_ID);

      expect(result).toEqual([
        {
          enrollmentId: ENROLLMENT_ID,
          teacherId: TEACHER_ID,
          teacher: TEACHER_PAIR.teacher,
          schoolSubject: TEACHER_PAIR.schoolSubject,
          lastMessage: "Hola profe",
          lastMessageAt: "2026-09-10T12:00:00.000Z",
          unreadCount: 2,
        },
      ]);
      expect(prisma.studentChatMessage.count).toHaveBeenCalledWith({
        where: {
          academicCycleEnrollmentId: ENROLLMENT_ID,
          teacherId: TEACHER_ID,
          sentBy: "teacher",
          read: false,
        },
      });
    });

    it("returns null lastMessage/lastMessageAt when there are no messages yet", async () => {
      prisma.studentChatMessage.findFirst.mockResolvedValue(null);
      prisma.studentChatMessage.count.mockResolvedValue(0);

      const result = await service.findAllChats(STUDENT_ID, ENROLLMENT_ID);

      expect(result[0]!.lastMessage).toBeNull();
      expect(result[0]!.lastMessageAt).toBeNull();
    });
  });

  describe("findMessages", () => {
    it("throws NotFoundError when the teacher doesn't teach this group", async () => {
      findAllTeachersMock.mockResolvedValue([]);

      await expect(
        service.findMessages(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, { page: 1, pageSize: 20 }),
      ).rejects.toThrow(NotFoundError);
    });

    it("fetches desc and reverses to ascending order for the response", async () => {
      prisma.studentChatMessage.findMany.mockResolvedValue([
        { id: "m2", teacherId: TEACHER_ID, sentBy: "student", content: "segundo", sentAt: new Date("2026-09-10T12:01:00.000Z") },
        { id: "m1", teacherId: TEACHER_ID, sentBy: "student", content: "primero", sentAt: new Date("2026-09-10T12:00:00.000Z") },
      ]);
      prisma.studentChatMessage.count.mockResolvedValue(2);

      const result = await service.findMessages(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, {
        page: 1,
        pageSize: 20,
      });

      expect(prisma.studentChatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { sentAt: "desc" }, skip: 0, take: 20 }),
      );
      expect(result.data.map((m) => m.id)).toEqual(["m1", "m2"]);
    });

    it("marks teacher messages as read when fetching page 1", async () => {
      prisma.studentChatMessage.findMany.mockResolvedValue([]);
      prisma.studentChatMessage.count.mockResolvedValue(0);

      await service.findMessages(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, {
        page: 1,
        pageSize: 20,
      });

      expect(prisma.studentChatMessage.updateMany).toHaveBeenCalledWith({
        where: {
          academicCycleEnrollmentId: ENROLLMENT_ID,
          teacherId: TEACHER_ID,
          sentBy: "teacher",
          read: false,
        },
        data: { read: true },
      });
    });

    it("does not mark as read when fetching a later page", async () => {
      prisma.studentChatMessage.findMany.mockResolvedValue([]);
      prisma.studentChatMessage.count.mockResolvedValue(0);

      await service.findMessages(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, {
        page: 2,
        pageSize: 20,
      });

      expect(prisma.studentChatMessage.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("sendMessage", () => {
    it("throws NotFoundError when the teacher doesn't teach this group", async () => {
      findAllTeachersMock.mockResolvedValue([]);

      await expect(
        service.sendMessage(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, "hola"),
      ).rejects.toThrow(NotFoundError);
      expect(prisma.studentChatMessage.create).not.toHaveBeenCalled();
    });

    it("creates the message with sentBy: student", async () => {
      prisma.student.findUnique.mockResolvedValue({ name: "Valentina", firstLastName: "Hernández" });
      prisma.studentChatMessage.create.mockResolvedValue({
        id: "msg-uuid",
        teacherId: TEACHER_ID,
        sentBy: "student",
        content: "hola profe",
        sentAt: new Date("2026-09-10T12:00:00.000Z"),
      });

      const result = await service.sendMessage(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, "hola profe");

      expect(prisma.studentChatMessage.create).toHaveBeenCalledWith({
        data: {
          academicCycleEnrollmentId: ENROLLMENT_ID,
          teacherId: TEACHER_ID,
          sentBy: "student",
          content: "hola profe",
        },
      });
      expect(result.sentBy).toBe("student");
      expect(result.chatId).toBe(TEACHER_ID);
    });

    it("notifies the teacher via the existing employee Notification table", async () => {
      prisma.student.findUnique.mockResolvedValue({ name: "Valentina", firstLastName: "Hernández" });
      prisma.studentChatMessage.create.mockResolvedValue({
        id: "msg-uuid",
        teacherId: TEACHER_ID,
        sentBy: "student",
        content: "hola profe",
        sentAt: new Date(),
      });

      await service.sendMessage(STUDENT_ID, ENROLLMENT_ID, TEACHER_ID, "hola profe");

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          employeeId: TEACHER_ID,
          type: "message",
          relatedRecordId: ENROLLMENT_ID,
          message: expect.stringContaining("Valentina Hernández"),
        }),
      });
    });
  });

  describe("findMessagesForTeacher", () => {
    it("throws NotFoundError when the enrollment isn't this student's own", async () => {
      prisma.academicCycleEnrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.findMessagesForTeacher(TEACHER_ID, STUDENT_ID, ENROLLMENT_ID, {
          page: 1,
          pageSize: 20,
        }),
      ).rejects.toThrow(NotFoundError);
      expect(resolveTeacherGroupScopeMock).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the teacher doesn't teach this group", async () => {
      resolveTeacherGroupScopeMock.mockRejectedValue(new NotFoundError("Class not found"));

      await expect(
        service.findMessagesForTeacher(TEACHER_ID, STUDENT_ID, ENROLLMENT_ID, {
          page: 1,
          pageSize: 20,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("fetches desc and reverses to ascending, without marking anything as read", async () => {
      prisma.studentChatMessage.findMany.mockResolvedValue([
        { id: "m2", teacherId: TEACHER_ID, sentBy: "teacher", content: "segundo", sentAt: new Date("2026-09-10T12:01:00.000Z") },
        { id: "m1", teacherId: TEACHER_ID, sentBy: "student", content: "primero", sentAt: new Date("2026-09-10T12:00:00.000Z") },
      ]);
      prisma.studentChatMessage.count.mockResolvedValue(2);

      const result = await service.findMessagesForTeacher(TEACHER_ID, STUDENT_ID, ENROLLMENT_ID, {
        page: 1,
        pageSize: 20,
      });

      expect(resolveTeacherGroupScopeMock).toHaveBeenCalledWith(
        prisma,
        TEACHER_ID,
        CYCLE_ID,
        GROUP_ID,
      );
      expect(result.data.map((m) => m.id)).toEqual(["m1", "m2"]);
      expect(prisma.studentChatMessage.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("sendMessageForTeacher", () => {
    it("throws NotFoundError when the teacher doesn't teach this group", async () => {
      resolveTeacherGroupScopeMock.mockRejectedValue(new NotFoundError("Class not found"));

      await expect(
        service.sendMessageForTeacher(TEACHER_ID, STUDENT_ID, ENROLLMENT_ID, "hola alumno"),
      ).rejects.toThrow(NotFoundError);
      expect(prisma.studentChatMessage.create).not.toHaveBeenCalled();
    });

    it("creates the message with sentBy: teacher", async () => {
      prisma.employee.findUnique.mockResolvedValue({ name: "Laura", firstLastName: "Fernández" });
      prisma.studentChatMessage.create.mockResolvedValue({
        id: "msg-uuid",
        teacherId: TEACHER_ID,
        sentBy: "teacher",
        content: "hola alumno",
        sentAt: new Date("2026-09-10T12:00:00.000Z"),
      });

      const result = await service.sendMessageForTeacher(
        TEACHER_ID,
        STUDENT_ID,
        ENROLLMENT_ID,
        "hola alumno",
      );

      expect(prisma.studentChatMessage.create).toHaveBeenCalledWith({
        data: {
          academicCycleEnrollmentId: ENROLLMENT_ID,
          teacherId: TEACHER_ID,
          sentBy: "teacher",
          content: "hola alumno",
        },
      });
      expect(result.sentBy).toBe("teacher");
    });

    it("notifies the student's own bell, not the teacher's", async () => {
      prisma.employee.findUnique.mockResolvedValue({ name: "Laura", firstLastName: "Fernández" });
      prisma.studentChatMessage.create.mockResolvedValue({
        id: "msg-uuid",
        teacherId: TEACHER_ID,
        sentBy: "teacher",
        content: "hola alumno",
        sentAt: new Date(),
      });

      await service.sendMessageForTeacher(TEACHER_ID, STUDENT_ID, ENROLLMENT_ID, "hola alumno");

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recipientType: "student",
          studentId: STUDENT_ID,
          type: "message",
          relatedRecordId: ENROLLMENT_ID,
          message: expect.stringContaining("Laura Fernández"),
        }),
      });
    });
  });
});
