import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "../../shared/errors/app-error";
import { env } from "../../shared/config/env.config";
import { logger } from "../../shared/lib/logger";
import type { IMailService } from "../../shared/services/mail.service";
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
    if (!employee.status) {
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
      email: employee.email,
      username: employee.username,
      image: employee.image,
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
   * Generate a temporary password, hash it, store it in DB, set mustChangePassword=true,
   * and send the plain text password via email.
   * Does nothing (silently) if the email doesn't match any employee — prevents account enumeration.
   */
  async forgotPassword(email: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    // Silent return if not found (don't reveal account existence)
    if (!employee) return;

    // Generate 8-char alphanumeric temp password
    const tempPassword = this.generateTempPassword();

    // Hash and update in DB
    const hashedPassword = await bcrypt.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: { password: hashedPassword, mustChangePassword: true },
    });

    // Send email (non-blocking — log errors but don't throw)
    this.mail
      .sendMail({
        to: employee.email,
        subject: "Recuperación de contraseña - Colegio Lear",
        html: `<h1>Hola ${employee.name}</h1><p>Tu nueva contraseña temporal es: <strong>${tempPassword}</strong></p><p>Por favor, cámbiala al iniciar sesión.</p>`,
      })
      .catch((err) => {
        logger.error("Failed to send forgot-password email", {
          error: err,
          employeeId: employee.id,
        });
      });
  }

  /**
   * Verify current password, hash new password, update DB, set mustChangePassword=false.
   * Throws UnauthorizedError if current password doesn't match.
   */
  async changePassword(
    employeeId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, password: true },
    });

    if (!employee) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      employee.password,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedError("La contraseña actual es incorrecta");
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      env.BCRYPT_SALT_ROUNDS,
    );
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { password: hashedNewPassword, mustChangePassword: false },
    });
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
