import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/app-error";
import { env } from "../../shared/config/env.config";
import { logger } from "../../shared/lib/logger";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type { IMailService } from "../../shared/services/mail.service";
import { forgotPasswordEmail } from "../../shared/templates/email.templates";
import type {
  StudentAuthLoginResult,
  StudentAuthResponse,
  StudentJwtPayloadData,
} from "./auth-student.types";

/** Fields selected off Student for building a StudentAuthResponse. */
const AUTH_STUDENT_SELECT = {
  id: true,
  name: true,
  firstLastName: true,
  secondLastName: true,
  enrollment: true,
  email: true,
  avatar: true,
  isActive: true,
  isDeleted: true,
  mustChangePassword: true,
  password: true,
  passwordResetCode: true,
  passwordResetCodeExpiresAt: true,
};

type AuthStudentRow = {
  id: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  enrollment: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  isDeleted: boolean;
  mustChangePassword: boolean;
  password: string;
  passwordResetCode: string | null;
  passwordResetCodeExpiresAt: Date | null;
};

/**
 * Business logic layer for the student-portal Auth module (`/auth/student`).
 * Mirrors modules/auth/auth.service.ts (employee auth) but against the
 * Student model, with a deliberately minimal AuthResponse payload — see
 * SERVICIOS_PORTAL_ALUMNO.md §3.1 for the exact field contract.
 */
export class AuthStudentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mail: IMailService,
  ) {}

  /**
   * Authenticate a student by email or enrollment (matrícula) + password.
   * Throws UnauthorizedError (401) for invalid credentials, ForbiddenError
   * (403) for inactive/deleted accounts — per SERVICIOS_PORTAL_ALUMNO.md
   * §3.1, those are distinct error codes.
   */
  async login(identifier: string, password: string): Promise<StudentAuthLoginResult> {
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: "insensitive" } },
          { enrollment: { equals: identifier, mode: "insensitive" } },
        ],
      },
      select: AUTH_STUDENT_SELECT,
    });

    if (!student) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    if (student.isDeleted || !student.isActive) {
      throw new ForbiddenError("Cuenta inactiva o dada de baja");
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const payload: StudentJwtPayloadData = {
      studentId: student.id,
      email: student.email,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRATION,
    } as SignOptions);

    const response = await this.buildAuthResponse(student);

    return { token, student: response };
  }

  /**
   * Return the authenticated student's profile data (root fields +
   * enrollments), for GET /auth/student/me.
   * Throws UnauthorizedError if the student no longer exists, is deleted,
   * or is inactive — same guard as login().
   */
  async getMe(studentId: string): Promise<StudentAuthResponse> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: AUTH_STUDENT_SELECT,
    });

    if (!student || student.isDeleted || !student.isActive) {
      throw new UnauthorizedError("Alumno no encontrado o inactivo");
    }

    return this.buildAuthResponse(student);
  }

  /**
   * Generate a new temporary password + a 6-digit confirmation code.
   * Same pattern as AuthService.requestResetPassword (employees): silently
   * no-ops if the email doesn't match any student, to avoid revealing
   * account existence.
   */
  async requestResetPassword(email: string): Promise<void> {
    const student = await this.prisma.student.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!student) return;

    const tempPassword = this.generateTempPassword();
    const hashedTempPassword = await bcrypt.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    const code = this.generateResetCode();
    const hashedCode = await bcrypt.hash(code, env.BCRYPT_SALT_ROUNDS);
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.student.update({
      where: { id: student.id },
      data: {
        password: hashedTempPassword,
        mustChangePassword: true,
        passwordResetCode: hashedCode,
        passwordResetCodeExpiresAt: codeExpiresAt,
      },
    });

    this.mail
      .sendMail({
        to: student.email,
        subject: "Recuperación de contraseña - Colegio Lear",
        html: forgotPasswordEmail({
          name: student.name,
          tempPassword,
          code,
        }),
      })
      .catch((err) => {
        logger.error("Failed to send student forgot-password email", {
          error: err,
          studentId: student.id,
        });
      });
  }

  /**
   * Complete a password reset for the authenticated student session
   * (identified by studentId from the JWT, established after logging in
   * with the temp password from requestResetPassword).
   */
  async resetPassword(
    studentId: string,
    code: string,
    password: string,
  ): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (
      !student ||
      !student.mustChangePassword ||
      !student.passwordResetCode ||
      !student.passwordResetCodeExpiresAt
    ) {
      throw new UnauthorizedError(
        "No hay una solicitud de restablecimiento de contraseña activa",
      );
    }

    if (student.passwordResetCodeExpiresAt < new Date()) {
      throw new UnauthorizedError(
        "El código de verificación ha expirado, solicita un nuevo restablecimiento",
      );
    }

    const isCodeValid = await bcrypt.compare(code, student.passwordResetCode);
    if (!isCodeValid) {
      throw new UnauthorizedError("Código de verificación incorrecto");
    }

    const hashedNewPassword = await bcrypt.hash(
      password,
      env.BCRYPT_SALT_ROUNDS,
    );
    await this.prisma.student.update({
      where: { id: student.id },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      },
    });
  }

  /**
   * Builds the minimal StudentAuthResponse: root student fields + every
   * academic cycle enrollment, each trimmed to exactly the fields
   * student-web consumes (see SERVICIOS_PORTAL_ALUMNO.md §3.1).
   */
  private async buildAuthResponse(
    student: AuthStudentRow,
  ): Promise<StudentAuthResponse> {
    const enrollments = await this.prisma.academicCycleEnrollment.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        status: true,
        academicCycleId: true,
        academicCycleSchoolGroupId: true,
        academicCycle: {
          select: {
            id: true,
            name: true,
            code: true,
            periodType: true,
            status: true,
            minimumPassingGrade: true,
            evaluationCount: true,
            startDate: true,
            endDate: true,
          },
        },
        academicCycleSchoolGroup: {
          select: { name: true, description: true },
        },
        scholarship: {
          select: { name: true, discountPercentage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      id: student.id,
      fullName: `${student.name} ${student.firstLastName} ${student.secondLastName}`,
      enrollment: student.enrollment,
      avatar: toPublicFileUrl(student.avatar),
      isActive: student.isActive,
      mustChangePassword: student.mustChangePassword,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        academicCycleId: e.academicCycleId,
        academicCycle: {
          id: e.academicCycle.id,
          name: e.academicCycle.name,
          code: e.academicCycle.code,
          periodType: e.academicCycle.periodType,
          status: e.academicCycle.status,
          minimumPassingGrade: e.academicCycle.minimumPassingGrade,
          evaluationCount: e.academicCycle.evaluationCount,
          startDate: e.academicCycle.startDate.toISOString(),
          endDate: e.academicCycle.endDate.toISOString(),
        },
        academicCycleSchoolGroupId: e.academicCycleSchoolGroupId,
        academicCycleSchoolGroup: {
          name: e.academicCycleSchoolGroup.name,
          description: e.academicCycleSchoolGroup.description,
        },
        scholarship: e.scholarship
          ? {
              name: e.scholarship.name,
              discountPercentage: Number(e.scholarship.discountPercentage),
            }
          : null,
      })),
    };
  }

  /** Generate an 8-character alphanumeric random password. */
  generateTempPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /** Generate a 6-digit numeric reset code. */
  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Parse JWT expiration string (e.g. "15m", "1h", "7d") to milliseconds. */
  parseExpirationToMs(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match || !match[1] || !match[2]) return 900000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 900000;
    }
  }
}
