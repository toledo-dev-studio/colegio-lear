import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationService } from "./notification.service";
import { NotFoundError, ForbiddenError } from "../../shared/errors/app-error";

/**
 * Unit tests for NotificationService. Focused on the student-recipient
 * behavior added alongside the employee-recipient flow (already covered
 * implicitly by production use): findAllPagedForStudent,
 * markAsReadForStudent, the student side of notifyAnnouncementPublished
 * (guardian-mediated email fan-out), and the student side of
 * releaseDueNotifications.
 */

function createMockPrisma() {
  const tx = {
    notification: { createMany: vi.fn() },
    announcement: { update: vi.fn() },
  };
  return {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    announcement: { update: vi.fn(), findUnique: vi.fn() },
    employee: { findMany: vi.fn() },
    student: { findMany: vi.fn() },
    studentGuardian: { findMany: vi.fn() },
    $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
    __tx: tx,
  };
}

function createMockMail() {
  return { sendMail: vi.fn().mockResolvedValue(undefined) };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;
type MockMail = ReturnType<typeof createMockMail>;

const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const NOTIFICATION_ID = "22222222-2222-4222-8222-222222222222";
const ANNOUNCEMENT_ID = "33333333-3333-4333-8333-333333333333";
const ACTOR_EMPLOYEE_ID = "44444444-4444-4444-8444-444444444444";

const BASE_NOTIFICATION_ROW = {
  id: NOTIFICATION_ID,
  title: "Nuevo comunicado",
  message: "Contenido",
  type: "announcement" as const,
  relatedRecordId: ANNOUNCEMENT_ID,
  createdAt: new Date("2026-08-20T10:00:00.000Z"),
  read: false,
};

describe("NotificationService", () => {
  let prisma: MockPrisma;
  let mail: MockMail;
  let service: NotificationService;

  beforeEach(() => {
    prisma = createMockPrisma();
    mail = createMockMail();
    service = new NotificationService(prisma as any, mail as any);
  });

  describe("findAllPagedForStudent", () => {
    it("filters by studentId, recipientType student, and sent:true", async () => {
      prisma.notification.findMany.mockResolvedValue([BASE_NOTIFICATION_ROW]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.findAllPagedForStudent(STUDENT_ID, {
        page: 1,
        limit: 10,
      });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId: STUDENT_ID, recipientType: "student", sent: true },
          orderBy: { createdAt: "desc" },
        }),
      );
      expect(result.data[0]!.id).toBe(NOTIFICATION_ID);
      expect(result.itemsCount).toBe(1);
    });
  });

  describe("markAsReadForStudent", () => {
    it("throws NotFoundError when the notification doesn't exist", async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.markAsReadForStudent(STUDENT_ID, NOTIFICATION_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError when it belongs to a different student", async () => {
      prisma.notification.findUnique.mockResolvedValue({
        ...BASE_NOTIFICATION_ROW,
        studentId: "someone-else",
      });

      await expect(
        service.markAsReadForStudent(STUDENT_ID, NOTIFICATION_ID),
      ).rejects.toThrow(ForbiddenError);
    });

    it("marks it read and increments the announcement's viewedCount", async () => {
      prisma.notification.findUnique.mockResolvedValue({
        ...BASE_NOTIFICATION_ROW,
        studentId: STUDENT_ID,
      });

      await service.markAsReadForStudent(STUDENT_ID, NOTIFICATION_ID);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: NOTIFICATION_ID },
        data: { read: true, readAt: expect.any(Date) },
      });
      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: ANNOUNCEMENT_ID },
        data: { viewedCount: { increment: 1 } },
      });
    });

    it("is a no-op when already read", async () => {
      prisma.notification.findUnique.mockResolvedValue({
        ...BASE_NOTIFICATION_ROW,
        studentId: STUDENT_ID,
        read: true,
      });

      await service.markAsReadForStudent(STUDENT_ID, NOTIFICATION_ID);

      expect(prisma.notification.update).not.toHaveBeenCalled();
      expect(prisma.announcement.update).not.toHaveBeenCalled();
    });
  });

  describe("notifyAnnouncementPublished — student recipients", () => {
    const announcement = {
      id: ANNOUNCEMENT_ID,
      name: "Junta de padres",
      description: "Este sábado a las 10am",
      audience: ["student"],
      publishedAt: new Date("2020-01-01T00:00:00.000Z"), // already due
    };

    const student = { id: STUDENT_ID, name: "Ana", firstLastName: "Pérez" };

    it("creates a student notification row per eligible student and syncs recipientsCount", async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([student]);
      prisma.studentGuardian.findMany.mockResolvedValue([]);

      await service.notifyAnnouncementPublished(announcement, ACTOR_EMPLOYEE_ID);

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            isDeleted: false,
            academicCycleEnrollments: {
              some: { status: "enrolled", academicCycle: { status: "active" } },
            },
          }),
        }),
      );
      expect(prisma.__tx.notification.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            recipientType: "student",
            studentId: STUDENT_ID,
            type: "announcement",
            relatedRecordId: ANNOUNCEMENT_ID,
            sent: true,
          }),
        ],
      });
      expect(prisma.__tx.announcement.update).toHaveBeenCalledWith({
        where: { id: ANNOUNCEMENT_ID },
        data: { recipientsCount: 1, viewedCount: 0, viewsCalculatedAt: expect.any(Date) },
      });
    });

    it("emails the student's principal guardian, not the student directly", async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([student]);
      prisma.studentGuardian.findMany.mockResolvedValue([
        {
          studentId: STUDENT_ID,
          fullName: "Juan Pérez",
          email: "juan.perez@example.com",
        },
      ]);

      await service.notifyAnnouncementPublished(announcement, ACTOR_EMPLOYEE_ID);
      await vi.waitFor(() => expect(mail.sendMail).toHaveBeenCalled());

      expect(prisma.studentGuardian.findMany).toHaveBeenCalledWith({
        where: { studentId: { in: [STUDENT_ID] }, isPrincipal: true },
        select: { studentId: true, fullName: true, email: true },
      });
      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "juan.perez@example.com" }),
      );
    });

    it("skips a guardian without an email on file", async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([student]);
      prisma.studentGuardian.findMany.mockResolvedValue([
        { studentId: STUDENT_ID, fullName: "Juan Pérez", email: null },
      ]);

      await service.notifyAnnouncementPublished(announcement, ACTOR_EMPLOYEE_ID);
      await new Promise((r) => setTimeout(r, 0));

      expect(mail.sendMail).not.toHaveBeenCalled();
    });

    it("does not resolve/send emails when publishedAt is in the future", async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([student]);

      await service.notifyAnnouncementPublished(
        { ...announcement, publishedAt: new Date("2099-01-01T00:00:00.000Z") },
        ACTOR_EMPLOYEE_ID,
      );

      expect(prisma.studentGuardian.findMany).not.toHaveBeenCalled();
      expect(mail.sendMail).not.toHaveBeenCalled();
      expect(prisma.__tx.notification.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ sent: false })],
      });
    });

    it("reverts the announcement to draft and notifies the actor on failure", async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([student]);
      prisma.$transaction.mockRejectedValueOnce(new Error("db down"));

      await service.notifyAnnouncementPublished(announcement, ACTOR_EMPLOYEE_ID);

      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: ANNOUNCEMENT_ID },
        data: { status: "draft", alreadyPublished: false },
      });
      const errorNotification = prisma.notification.create.mock.calls.find(
        (call) => call[0].data.type === "error",
      );
      expect(errorNotification).toBeTruthy();
    });
  });

  describe("releaseDueNotifications — student recipients", () => {
    it("emails the student's guardian and marks the notification sent", async () => {
      prisma.notification.findMany.mockResolvedValue([
        {
          id: NOTIFICATION_ID,
          employeeId: null,
          studentId: STUDENT_ID,
          relatedRecordId: ANNOUNCEMENT_ID,
          type: "announcement",
          deliveryAttempts: 0,
        },
      ]);
      prisma.announcement.findUnique.mockResolvedValue({
        id: ANNOUNCEMENT_ID,
        name: "Junta de padres",
        description: "Este sábado a las 10am",
      });
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([
        { id: STUDENT_ID, name: "Ana", firstLastName: "Pérez" },
      ]);
      prisma.studentGuardian.findMany.mockResolvedValue([
        { studentId: STUDENT_ID, fullName: "Juan Pérez", email: "juan.perez@example.com" },
      ]);

      await service.releaseDueNotifications();

      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "juan.perez@example.com" }),
      );
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: NOTIFICATION_ID },
        data: { sent: true },
      });
    });

    it("releases with no email attempt when the student has no guardian on file", async () => {
      prisma.notification.findMany.mockResolvedValue([
        {
          id: NOTIFICATION_ID,
          employeeId: null,
          studentId: STUDENT_ID,
          relatedRecordId: ANNOUNCEMENT_ID,
          type: "announcement",
          deliveryAttempts: 0,
        },
      ]);
      prisma.announcement.findUnique.mockResolvedValue({
        id: ANNOUNCEMENT_ID,
        name: "Junta de padres",
        description: null,
      });
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.student.findMany.mockResolvedValue([
        { id: STUDENT_ID, name: "Ana", firstLastName: "Pérez" },
      ]);
      prisma.studentGuardian.findMany.mockResolvedValue([]);

      await service.releaseDueNotifications();

      expect(mail.sendMail).not.toHaveBeenCalled();
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: NOTIFICATION_ID },
        data: { sent: true },
      });
    });

    it("does nothing when there are no due notifications", async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await service.releaseDueNotifications();

      expect(prisma.announcement.findUnique).not.toHaveBeenCalled();
    });
  });
});
