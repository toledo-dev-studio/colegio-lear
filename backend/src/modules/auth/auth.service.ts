import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "../../shared/errors/app-error";
import { env } from "../../shared/config/env.config";
import { logger } from "../../shared/lib/logger";
import type { IMailService } from "../../shared/services/mail.service";
import { forgotPasswordEmail } from "../../shared/templates/email.templates";
import type { LoginResult, LoginResponse, JwtPayloadData } from "./auth.types";

/**
 * Business logic layer for the Auth module.
 * Handles login, password-reset request/confirmation, and utility methods
 * for password generation and JWT expiration parsing.
 */
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mail: IMailService,
  ) {}

  /**
   * Authenticate an employee by username/email + password.
   * Queries Employee by username OR email (case-insensitive), verifies password,
   * generates JWT with { employeeId, email, securityRoleId }.
   * Returns the signed token and employee data (without password) including
   * securityRole with permissions and jobTitle.
   *
   * Throws UnauthorizedError for invalid credentials or inactive accounts.
   * Uses the same generic message for "not found" and "wrong password" to prevent
   * credential enumeration.
   */
  async login(identifier: string, password: string): Promise<LoginResult> {
    // Find employee by username OR email (case-insensitive)
    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: "insensitive" } },
          { email: { equals: identifier, mode: "insensitive" } },
        ],
      },
      include: {
        securityRole: { include: { permissions: true } },
        jobTitle: true,
      },
    });

    // Generic error for not found (prevent credential enumeration)
    if (!employee) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Check if account is active
    if (!employee.isActive) {
      throw new UnauthorizedError("Cuenta deshabilitada");
    }

    // Verify password against bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Build JWT payload
    const payload: JwtPayloadData = {
      employeeId: employee.id,
      email: employee.email,
      securityRoleId: employee.securityRoleId,
    };

    // Sign JWT with configured secret and expiration
    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRATION,
    } as SignOptions);

    // Build response object (exclude password, cast jobTitleType enum to string)
    const loginResponse: LoginResponse = {
      id: employee.id,
      name: employee.name,
      firstLastName: employee.firstLastName,
      secondLastName: employee.secondLastName,
      phoneNumber: employee.phoneNumber,
      email: employee.email,
      username: employee.username,
      avatar: employee.avatar,
      mustChangePassword: employee.mustChangePassword,
      securityRole: {
        id: employee.securityRole.id,
        name: employee.securityRole.name,
        permissions: employee.securityRole.permissions.map((p) => ({
          moduleKey: p.moduleKey,
          canRead: p.canRead,
          canWrite: p.canWrite,
          canDelete: p.canDelete,
        })),
      },
      jobTitle: {
        id: employee.jobTitle.id,
        name: employee.jobTitle.name,
        jobTitleType: String(employee.jobTitle.jobTitleType),
      },
    };

    return { token, employee: loginResponse };
  }

  /**
   * Generate a new temporary password + a 6-digit confirmation code.
   * Immediately sets the employee's password to the temp password and
   * mustChangePassword=true (same pattern as employee invitations), and
   * stores a hashed version of the code + its expiration for later
   * verification by resetPassword(). Emails the plain temp password + code.
   * Does nothing (silently) if the email doesn't match any employee, to
   * avoid revealing account existence.
   */
  async requestResetPassword(email: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    // Silent return if not found (don't reveal account existence)
    if (!employee) return;

    // Generate temp password (same pattern as employee invitations)
    const tempPassword = this.generateTempPassword();
    const hashedTempPassword = await bcrypt.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    // Generate 6-digit code, store only its hash
    const code = this.generateResetCode();
    const hashedCode = await bcrypt.hash(code, env.BCRYPT_SALT_ROUNDS);
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        password: hashedTempPassword,
        mustChangePassword: true,
        passwordResetCode: hashedCode,
        passwordResetCodeExpiresAt: codeExpiresAt,
      },
    });

    // Send email with temp password + code (non-blocking)
    this.mail
      .sendMail({
        to: employee.email,
        subject: "Recuperación de contraseña - Colegio Lear",
        html: forgotPasswordEmail({
          name: employee.name,
          tempPassword,
          code,
        }),
      })
      .catch((err) => {
        logger.error("Failed to send forgot-password email", {
          error: err,
          employeeId: employee.id,
        });
      });
  }

  /**
   * Complete a password reset for the authenticated employee (identified by
   * employeeId from the JWT session, established after logging in with the
   * temp password from requestResetPassword). Verifies the 6-digit code
   * against the hash stored by requestResetPassword and its expiration,
   * then sets the final password and clears mustChangePassword + the code.
   * Throws UnauthorizedError if there's no active reset request, it expired,
   * or the code doesn't match.
   */
  async resetPassword(
    employeeId: string,
    code: string,
    password: string,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (
      !employee ||
      !employee.mustChangePassword ||
      !employee.passwordResetCode ||
      !employee.passwordResetCodeExpiresAt
    ) {
      throw new UnauthorizedError(
        "No hay una solicitud de restablecimiento de contraseña activa",
      );
    }

    if (employee.passwordResetCodeExpiresAt < new Date()) {
      throw new UnauthorizedError(
        "El código de verificación ha expirado, solicita un nuevo restablecimiento",
      );
    }

    const isCodeValid = await bcrypt.compare(
      code,
      employee.passwordResetCode,
    );
    if (!isCodeValid) {
      throw new UnauthorizedError("Código de verificación incorrecto");
    }

    const hashedNewPassword = await bcrypt.hash(
      password,
      env.BCRYPT_SALT_ROUNDS,
    );
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      },
    });
  }

  /**
   * Return the authenticated employee's profile data.
   * Fetches the full employee record by ID including securityRole (with permissions)
   * and jobTitle. Returns the same shape as LoginResponse.
   * Throws UnauthorizedError if the employee no longer exists or is inactive.
   */
  async getMe(employeeId: string): Promise<LoginResponse> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        securityRole: { include: { permissions: true } },
        jobTitle: true,
      },
    });

    if (!employee || !employee.isActive) {
      throw new UnauthorizedError("Empleado no encontrado o inactivo");
    }

    return {
      id: employee.id,
      name: employee.name,
      firstLastName: employee.firstLastName,
      secondLastName: employee.secondLastName,
      phoneNumber: employee.phoneNumber,
      email: employee.email,
      username: employee.username,
      avatar: employee.avatar,
      mustChangePassword: employee.mustChangePassword,
      securityRole: {
        id: employee.securityRole.id,
        name: employee.securityRole.name,
        permissions: employee.securityRole.permissions.map((p) => ({
          moduleKey: p.moduleKey,
          canRead: p.canRead,
          canWrite: p.canWrite,
          canDelete: p.canDelete,
        })),
      },
      jobTitle: {
        id: employee.jobTitle.id,
        name: employee.jobTitle.name,
        jobTitleType: String(employee.jobTitle.jobTitleType),
      },
    };
  }

  /**
   * Generate an 8-character alphanumeric random password.
   * Characters: [a-zA-Z0-9]
   */
  generateTempPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a 6-digit numeric reset code.
   */
  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Parse JWT expiration string (e.g. "15m", "1h", "7d") to milliseconds.
   * Supports: s (seconds), m (minutes), h (hours), d (days).
   * Returns 900000 (15 minutes) as default if format is unrecognized.
   */
  parseExpirationToMs(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match || !match[1] || !match[2]) return 900000; // default 15 minutes

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
