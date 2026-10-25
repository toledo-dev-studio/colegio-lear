import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthStudentService } from "./auth-student.service";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/app-error";

/**
 * Unit tests for AuthStudentService.
 * PrismaClient, bcrypt, jsonwebtoken and the mail service are fully mocked
 * to isolate business logic — same approach as scholarship.test.ts.
 */

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "signed.jwt.token"),
  },
}));

import bcrypt from "bcrypt";

// --- Mock PrismaClient factory ---
function createMockPrisma() {
  return {
    student: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    academicCycleEnrollment: {
      findMany: vi.fn(),
    },
  };
}

function createMockMail() {
  return { sendMail: vi.fn().mockResolvedValue(undefined) };
}

type MockPrisma = ReturnType<typeof createMockPrisma>;
type MockMail = ReturnType<typeof createMockMail>;

const BASE_STUDENT = {
  id: "student-uuid",
  name: "Valentina",
  firstLastName: "Hernández",
  secondLastName: "Ramírez",
  enrollment: "LR-2026-0001",
  email: "valentina@colegiolear.com.mx",
  avatar: null,
  isActive: true,
  isDeleted: false,
  mustChangePassword: false,
  password: "hashed-password",
  passwordResetCode: null,
  passwordResetCodeExpiresAt: null,
};

describe("AuthStudentService", () => {
  let prisma: MockPrisma;
  let mail: MockMail;
  let service: AuthStudentService;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = createMockPrisma();
    mail = createMockMail();
    service = new AuthStudentService(prisma as any, mail as any);
    prisma.academicCycleEnrollment.findMany.mockResolvedValue([]);
  });

  // --- login ---
  describe("login", () => {
    it("should authenticate by enrollment (matrícula) and return the minimal auth payload", async () => {
      prisma.student.findFirst.mockResolvedValue(BASE_STUDENT);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login("LR-2026-0001", "Estudiante123!");

      expect(prisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { equals: "LR-2026-0001", mode: "insensitive" } },
            { enrollment: { equals: "LR-2026-0001", mode: "insensitive" } },
          ],
        },
        select: expect.any(Object),
      });
      expect(result.token).toBe("signed.jwt.token");
      expect(result.student).toEqual({
        id: "student-uuid",
        fullName: "Valentina Hernández Ramírez",
        enrollment: "LR-2026-0001",
        avatar: null,
        isActive: true,
        mustChangePassword: false,
        enrollments: [],
      });
      // The response payload must never leak the student's email (see
      // SERVICIOS_PORTAL_ALUMNO.md §3.1 — email is fetched separately via
      // GET /students/me).
      expect(result.student).not.toHaveProperty("email");
    });

    it("should authenticate by email case-insensitively", async () => {
      prisma.student.findFirst.mockResolvedValue(BASE_STUDENT);
      (bcrypt.compare as any).mockResolvedValue(true);

      await service.login("VALENTINA@colegiolear.com.mx", "Estudiante123!");

      expect(prisma.student.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                email: {
                  equals: "VALENTINA@colegiolear.com.mx",
                  mode: "insensitive",
                },
              },
              {
                enrollment: {
                  equals: "VALENTINA@colegiolear.com.mx",
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
      );
    });

    it("should throw UnauthorizedError when no student matches", async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await expect(service.login("nobody", "pw")).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.login("nobody", "pw")).rejects.toThrow(
        "Credenciales inválidas",
      );
    });

    it("should throw UnauthorizedError when the password does not match", async () => {
      prisma.student.findFirst.mockResolvedValue(BASE_STUDENT);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login("LR-2026-0001", "wrong-password"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw ForbiddenError (not UnauthorizedError) for an inactive student", async () => {
      prisma.student.findFirst.mockResolvedValue({
        ...BASE_STUDENT,
        isActive: false,
      });

      await expect(
        service.login("LR-2026-0001", "Estudiante123!"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw ForbiddenError for a deleted (dropped) student", async () => {
      prisma.student.findFirst.mockResolvedValue({
        ...BASE_STUDENT,
        isDeleted: true,
      });

      await expect(
        service.login("LR-2026-0001", "Estudiante123!"),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should not compare passwords when the account is inactive (fail fast)", async () => {
      prisma.student.findFirst.mockResolvedValue({
        ...BASE_STUDENT,
        isActive: false,
      });

      await expect(
        service.login("LR-2026-0001", "Estudiante123!"),
      ).rejects.toThrow(ForbiddenError);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should map every enrollment field required by the student portal", async () => {
      prisma.student.findFirst.mockResolvedValue(BASE_STUDENT);
      (bcrypt.compare as any).mockResolvedValue(true);
      prisma.academicCycleEnrollment.findMany.mockResolvedValue([
        {
          id: "enrollment-uuid",
          status: "enrolled",
          academicCycleId: "cycle-uuid",
          academicCycleSchoolGroupId: "group-uuid",
          academicCycle: {
            id: "cycle-uuid",
            name: "2026 - 2027",
            code: "2026-A",
            periodType: "annual",
            status: "active",
            minimumPassingGrade: 6,
            evaluationCount: 3,
            startDate: new Date("2026-08-10T00:00:00.000Z"),
            endDate: new Date("2027-07-09T23:59:59.999Z"),
          },
          academicCycleSchoolGroup: {
            name: "Primero A (2026-2027)",
            description: "Grupo de estudiantes del primer año",
          },
          scholarship: { name: "Beca deportiva", discountPercentage: 30 },
        },
      ]);

      const result = await service.login("LR-2026-0001", "Estudiante123!");

      expect(result.student.enrollments).toEqual([
        {
          id: "enrollment-uuid",
          status: "enrolled",
          academicCycleId: "cycle-uuid",
          academicCycle: {
            id: "cycle-uuid",
            name: "2026 - 2027",
            code: "2026-A",
            periodType: "annual",
            status: "active",
            minimumPassingGrade: 6,
            evaluationCount: 3,
            startDate: "2026-08-10T00:00:00.000Z",
            endDate: "2027-07-09T23:59:59.999Z",
          },
          academicCycleSchoolGroupId: "group-uuid",
          academicCycleSchoolGroup: {
            name: "Primero A (2026-2027)",
            description: "Grupo de estudiantes del primer año",
          },
          scholarship: { name: "Beca deportiva", discountPercentage: 30 },
        },
      ]);
    });

    it("should return scholarship: null when the enrollment has no scholarship", async () => {
      prisma.student.findFirst.mockResolvedValue(BASE_STUDENT);
      (bcrypt.compare as any).mockResolvedValue(true);
      prisma.academicCycleEnrollment.findMany.mockResolvedValue([
        {
          id: "enrollment-uuid",
          status: "enrolled",
          academicCycleId: "cycle-uuid",
          academicCycleSchoolGroupId: "group-uuid",
          academicCycle: {
            id: "cycle-uuid",
            name: "2026 - 2027",
            code: "2026-A",
            periodType: "annual",
            status: "active",
            minimumPassingGrade: 6,
            evaluationCount: 3,
            startDate: new Date("2026-08-10T00:00:00.000Z"),
            endDate: new Date("2027-07-09T23:59:59.999Z"),
          },
          academicCycleSchoolGroup: { name: "Primero A", description: null },
          scholarship: null,
        },
      ]);

      const result = await service.login("LR-2026-0001", "Estudiante123!");

      expect(result.student.enrollments[0]!.scholarship).toBeNull();
    });
  });

  // --- getMe ---
  describe("getMe", () => {
    it("should return the auth payload for an active student", async () => {
      prisma.student.findUnique.mockResolvedValue(BASE_STUDENT);

      const result = await service.getMe("student-uuid");

      expect(result.id).toBe("student-uuid");
      expect(result.enrollments).toEqual([]);
    });

    it("should throw UnauthorizedError when the student no longer exists", async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.getMe("gone-uuid")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("should throw UnauthorizedError when the student is inactive", async () => {
      prisma.student.findUnique.mockResolvedValue({
        ...BASE_STUDENT,
        isActive: false,
      });

      await expect(service.getMe("student-uuid")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("should throw UnauthorizedError when the student is deleted", async () => {
      prisma.student.findUnique.mockResolvedValue({
        ...BASE_STUDENT,
        isDeleted: true,
      });

      await expect(service.getMe("student-uuid")).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });

  // --- requestResetPassword ---
  describe("requestResetPassword", () => {
    it("should generate a temp password + code, update the student, and email it", async () => {
      prisma.student.findFirst.mockResolvedValue(BASE_STUDENT);
      (bcrypt.hash as any).mockResolvedValue("hashed-value");

      await service.requestResetPassword("valentina@colegiolear.com.mx");

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: "student-uuid" },
        data: {
          password: "hashed-value",
          mustChangePassword: true,
          passwordResetCode: "hashed-value",
          passwordResetCodeExpiresAt: expect.any(Date),
        },
      });
      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "valentina@colegiolear.com.mx" }),
      );
    });

    it("should silently no-op when the email does not match any student", async () => {
      prisma.student.findFirst.mockResolvedValue(null);

      await service.requestResetPassword("nobody@colegiolear.com.mx");

      expect(prisma.student.update).not.toHaveBeenCalled();
      expect(mail.sendMail).not.toHaveBeenCalled();
    });
  });

  // --- resetPassword ---
  describe("resetPassword", () => {
    const studentWithActiveReset = {
      ...BASE_STUDENT,
      mustChangePassword: true,
      passwordResetCode: "hashed-code",
      passwordResetCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };

    it("should update the password when the code is valid and not expired", async () => {
      prisma.student.findUnique.mockResolvedValue(studentWithActiveReset);
      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue("new-hashed-password");

      await service.resetPassword("student-uuid", "654321", "NuevaPass123");

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: "student-uuid" },
        data: {
          password: "new-hashed-password",
          mustChangePassword: false,
          passwordResetCode: null,
          passwordResetCodeExpiresAt: null,
        },
      });
    });

    it("should throw UnauthorizedError when there is no active reset request", async () => {
      prisma.student.findUnique.mockResolvedValue({
        ...BASE_STUDENT,
        mustChangePassword: false,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      });

      await expect(
        service.resetPassword("student-uuid", "654321", "NuevaPass123"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError when the code has expired", async () => {
      prisma.student.findUnique.mockResolvedValue({
        ...studentWithActiveReset,
        passwordResetCodeExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword("student-uuid", "654321", "NuevaPass123"),
      ).rejects.toThrow(
        "El código de verificación ha expirado, solicita un nuevo restablecimiento",
      );
    });

    it("should throw UnauthorizedError when the code is incorrect", async () => {
      prisma.student.findUnique.mockResolvedValue(studentWithActiveReset);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.resetPassword("student-uuid", "000000", "NuevaPass123"),
      ).rejects.toThrow("Código de verificación incorrecto");
    });

    it("should throw UnauthorizedError when the student does not exist", async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword("gone-uuid", "654321", "NuevaPass123"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
