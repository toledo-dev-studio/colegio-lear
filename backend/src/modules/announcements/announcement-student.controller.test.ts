import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundError, ValidationError } from "../../shared/errors/app-error";

/**
 * Unit tests for the student-portal announcement-detail handler.
 * gateStudentSession, prisma, and AnnouncementService are all mocked so
 * this only exercises: the ownership check (was a "student" notification
 * pointing at this announcement ever created for the requesting student?)
 * and correct delegation to the shared service.
 */

vi.mock("../../shared/middleware/gate-student-session.middleware", () => ({
  gateStudentSession: vi.fn(),
}));

vi.mock("../../shared/lib/prisma", () => ({
  prisma: {
    notification: { findFirst: vi.fn() },
  },
}));

const { findByIdMock } = vi.hoisted(() => ({
  findByIdMock: vi.fn(),
}));
vi.mock("./announcement.service", () => ({
  AnnouncementService: vi.fn().mockImplementation(function () {
    return { findById: findByIdMock };
  }),
}));

import { gateStudentSession } from "../../shared/middleware/gate-student-session.middleware";
import { prisma } from "../../shared/lib/prisma";
import { getByIdStudent } from "./announcement-student.controller";

const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const ANNOUNCEMENT_ID = "22222222-2222-4222-8222-222222222222";

function buildReqRes() {
  const req = {
    student: { studentId: STUDENT_ID, email: "a@b.com" },
    params: { id: ANNOUNCEMENT_ID },
  } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe("getByIdStudent (student portal)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early (no response) when gateStudentSession falls through", async () => {
    (gateStudentSession as any).mockResolvedValue(false);
    const { req, res, next } = buildReqRes();

    await getByIdStudent(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(prisma.notification.findFirst).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when this announcement was never sent to the student", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.notification.findFirst as any).mockResolvedValue(null);
    const { req, res, next } = buildReqRes();

    await expect(getByIdStudent(req, res, next)).rejects.toThrow(NotFoundError);
    expect(findByIdMock).not.toHaveBeenCalled();
  });

  it("checks ownership scoped to the requesting student's notifications", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.notification.findFirst as any).mockResolvedValue({ id: "notif-1" });
    findByIdMock.mockResolvedValue({ id: ANNOUNCEMENT_ID });
    const { req, res, next } = buildReqRes();

    await getByIdStudent(req, res, next);

    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: {
        studentId: STUDENT_ID,
        relatedRecordId: ANNOUNCEMENT_ID,
        type: "announcement",
        recipientType: "student",
      },
      select: { id: true },
    });
  });

  it("delegates to AnnouncementService.findById and returns its data", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    (prisma.notification.findFirst as any).mockResolvedValue({ id: "notif-1" });
    const detail = { id: ANNOUNCEMENT_ID, name: "Junta de padres" };
    findByIdMock.mockResolvedValue(detail);
    const { req, res, next } = buildReqRes();

    await getByIdStudent(req, res, next);

    expect(findByIdMock).toHaveBeenCalledWith(ANNOUNCEMENT_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(detail);
  });

  it("throws ValidationError when the id param isn't a valid UUID", async () => {
    (gateStudentSession as any).mockResolvedValue(true);
    const { req, res, next } = buildReqRes();
    req.params = { id: "not-a-uuid" };

    await expect(getByIdStudent(req, res, next)).rejects.toThrow(ValidationError);
  });
});
