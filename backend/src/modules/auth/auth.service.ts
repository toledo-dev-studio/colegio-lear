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
 * Handles login, forgot-password, change-password, and utility methods
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
   * Generate a 6-digit code, create a reset JWT containing employeeId + code,
   * and send an email with the code and a reset link containing the token.
   * Does nothing (silently) if the username/email doesn't match any employee.
   */
  async forgotPassword(username: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { email: { equals: username, mode: "insensitive" } },
        ],
      },
    });

    // Silent return if not found (don't reveal account existence)
    if (!employee) return;

    // Generate 6-digit numeric code
    const code = this.generateResetCode();

    // Generate reset token with employeeId + code (expires in 10 minutes)
    const resetToken = jwt.sign(
      { employeeId: employee.id, code },
      env.JWT_SECRET,
      { expiresIn: "10m" } as SignOptions,
    );

    // Build reset link with token as query param
    const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Set mustChangePassword flag
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: { mustChangePassword: true },
    });

    // Send email with code + link (non-blocking)
    this.mail
      .sendMail({
        to: employee.email,
        subject: "Recuperación de contraseña - Colegio Lear",
        html: forgotPasswordEmail({
          name: employee.name,
          code,
          resetLink,
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
   * Verify reset token, verify current password, hash new password, update DB, set mustChangePassword=false.
   * The resetToken is a short-lived JWT (5 min) generated by forgotPassword.
   * Throws UnauthorizedError if token is invalid/expired or code doesn't match.
   */
  async changePassword(
    token: string,
    code: string,
    password: string,
  ): Promise<void> {
    // Verify and decode the reset token
    let employeeId: string;
    let tokenCode: string;
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        employeeId: string;
        code: string;
      };
      employeeId = decoded.employeeId;
      tokenCode = decoded.code;
    } catch {
      throw new UnauthorizedError("Token de recuperación inválido o expirado");
    }

    // Verify the code matches
    if (code !== tokenCode) {
      throw new UnauthorizedError("Código de verificación incorrecto");
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!employee) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(
      password,
      env.BCRYPT_SALT_ROUNDS,
    );
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: { password: hashedNewPassword, mustChangePassword: false },
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
