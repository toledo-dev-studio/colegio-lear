import { PrismaClient } from "../../generated/prisma/client";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type {
  EmployeeFilters,
  EmployeeRecord,
  EmployeeDetail,
  PagedResult,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateMyAccountDto,
  FileUpload,
  SecurityRolePermissionView,
} from "./employee.types";
import {
  EMPLOYEE_LIST_SELECT,
  EMPLOYEE_DETAIL_INCLUDE,
} from "./employee.types";
import { toFrontendJobTitleType } from "../job-titles/job-title.service";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";
import type { IStorageService } from "../../shared/services/storage.service";
import type { IMailService } from "../../shared/services/mail.service";
import type { LoginResponse } from "../auth/auth.types";
import {
  invitationEmail,
  resendInvitationEmail,
} from "../../shared/templates/email.templates";
import { logger } from "../../shared/lib/logger";
import { env } from "../../shared/config/env.config";

/**
 * Business logic layer for the Employees module.
 * Handles CRUD operations, username generation with collision resolution,
 * file upload via IStorageService, and email notifications via IMailService.
 * Dependencies are injected via constructor for testability.
 */
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: IStorageService,
    private readonly mail: IMailService,
  ) {}

  /**
   * Build a Prisma `where` clause from the provided employee filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches name, firstLastName, secondLastName, or email (OR logic, case-insensitive).
   */
  private buildWhereClause(filters: EmployeeFilters): Record<string, unknown> {
    const where: Record<string, unknown> = { isDeleted: false };
    const andConditions: unknown[] = [];

    // Full-text search across name, firstLastName, secondLastName, email (OR logic, case-insensitive)
    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { firstLastName: { contains: filters.q, mode: "insensitive" } },
          { secondLastName: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
        ],
      });
    }

    // fullName filter (case-insensitive contains on the name column)
    if (filters.fullName) {
      andConditions.push({
        name: { contains: filters.fullName, mode: "insensitive" },
      });
    }

    // isActive filter (exact boolean match)
    if (filters.isActive !== undefined) {
      andConditions.push({ isActive: filters.isActive });
    }

    // SecurityRole filter (exact match)
    if (filters.securityRoleId) {
      andConditions.push({ securityRoleId: filters.securityRoleId });
    }

    // JobTitle filter (exact match)
    if (filters.jobTitleId) {
      andConditions.push({ jobTitleId: filters.jobTitleId });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * Generate a username from name and firstLastName.
   * Pure function: first character of name (lowercase) + firstLastName (lowercase, no spaces).
   * Example: "Omar" + "Trejo" → "otrejo"
   * Example: "Ana" + "De la Cruz" → "adelacruz"
   */
  generateUsername(name: string, firstLastName: string): string {
    const firstChar = name.charAt(0).toLowerCase();
    return firstChar + firstLastName.toLowerCase().replace(/\s/g, "");
  }

  /**
   * Resolve username collisions by finding the smallest available numeric suffix.
   * Queries DB for all usernames starting with the base.
   * If base is not taken, returns base directly.
   * Otherwise, finds the smallest positive integer N such that `base + N` is available.
   */
  async resolveUsernameCollision(base: string): Promise<string> {
    const existing = await this.prisma.employee.findMany({
      where: { username: { startsWith: base } },
      select: { username: true },
    });

    const existingUsernames = new Set(existing.map((e) => e.username));

    // If base itself is not taken, use it directly
    if (!existingUsernames.has(base)) {
      return base;
    }

    // Find the smallest positive integer suffix not in use
    let suffix = 1;
    while (existingUsernames.has(`${base}${suffix}`)) {
      suffix++;
    }

    return `${base}${suffix}`;
  }

  /**
   * Generate a 6-digit numeric security code, for the invitation email
   * (see create()/resendInvitation()) — same format as
   * AuthService.generateResetCode(), duplicated here rather than adding a
   * cross-module dependency for one line.
   */
  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Map a Prisma employee result (with EMPLOYEE_DETAIL_INCLUDE) to EmployeeDetail.
   * Transforms securityRole.permissions to exclude `id` and `securityRoleId` fields.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToEmployeeDetail(record: any): EmployeeDetail {
    const permissions: SecurityRolePermissionView[] =
      record.securityRole.permissions.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => ({
          moduleKey: p.moduleKey,
          canRead: p.canRead,
          canWrite: p.canWrite,
          canDelete: p.canDelete,
        }),
      );

    return {
      id: record.id,
      name: record.name,
      firstLastName: record.firstLastName,
      secondLastName: record.secondLastName,
      phoneNumber: record.phoneNumber,
      email: record.email,
      username: record.username,
      avatar: toPublicFileUrl(record.avatar),
      isActive: record.isActive,
      securityRoleId: record.securityRoleId,
      jobTitleId: record.jobTitleId,
      jobTitle: {
        id: record.jobTitle.id,
        name: record.jobTitle.name,
        description: record.jobTitle.description,
        jobTitleType: toFrontendJobTitleType(record.jobTitle.jobTitleType),
        isActive: record.jobTitle.isActive,
      },
      securityRole: {
        id: record.securityRole.id,
        name: record.securityRole.name,
        description: record.securityRole.description,
        isActive: record.securityRole.isActive,
        permissions,
      },
    };
  }

  /**
   * Map a Prisma employee result (selected via EMPLOYEE_LIST_SELECT) to EmployeeRecord.
   * EMPLOYEE_LIST_SELECT already whitelists the exact fields needed, so this only
   * normalizes jobTitleType to the frontend-compatible hyphenated format.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEmployeeRecord(record: any): EmployeeRecord {
    return {
      ...record,
      avatar: toPublicFileUrl(record.avatar),
      jobTitle: {
        ...record.jobTitle,
        jobTitleType: toFrontendJobTitleType(record.jobTitle.jobTitleType),
      },
    };
  }

  /**
   * List all employees (no pagination) with optional filters.
   * Excludes the authenticated employee from results.
   * Includes jobTitle and securityRole (without permissions).
   */
  async findAll(
    filters: EmployeeFilters,
    excludeEmployeeId: string,
  ): Promise<EmployeeRecord[]> {
    const where = this.buildWhereClause(filters);
    // Exclude the authenticated user from the list
    (where as Record<string, unknown>).id = { not: excludeEmployeeId };

    const results = await this.prisma.employee.findMany({
      where,
      select: EMPLOYEE_LIST_SELECT,
    });

    return results.map((r) => this.toEmployeeRecord(r));
  }

  /**
   * List only active employees whose jobTitle type is "teacher".
   * Returns a simplified list for selects/dropdowns in other modules.
   */
  async findAllTeachers(): Promise<EmployeeRecord[]> {
    const results = await this.prisma.employee.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        jobTitle: { jobTitleType: "teacher" as never },
      },
      select: EMPLOYEE_LIST_SELECT,
    });

    return results.map((r) => this.toEmployeeRecord(r));
  }

  /**
   * List employees with pagination and optional filters.
   * Excludes the authenticated employee from results.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: EmployeeFilters,
    pagination: PaginationParams,
    excludeEmployeeId: string,
  ): Promise<PagedResult<EmployeeRecord>> {
    const where = this.buildWhereClause(filters);
    // Exclude the authenticated user from the list
    (where as Record<string, unknown>).id = { not: excludeEmployeeId };
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: pagination.limit,
        select: EMPLOYEE_LIST_SELECT,
      }),
      this.prisma.employee.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((r) => this.toEmployeeRecord(r)),
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single employee by ID with full relations (securityRole with permissions).
   * Throws NotFoundError if the employee does not exist or is deleted.
   */
  async findById(id: string): Promise<EmployeeDetail> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: EMPLOYEE_DETAIL_INCLUDE,
    });

    if (!employee || employee.isDeleted) {
      throw new NotFoundError("Empleado no encontrado");
    }

    return this.mapToEmployeeDetail(employee);
  }

  /**
   * Create a new employee.
   * - Validates email uniqueness (case-insensitive)
   * - Validates FK references (securityRoleId, jobTitleId)
   * - Generates username with collision resolution
   * - Creates record with isActive=true by default (or dto.isActive when provided).
   *   Avatar starts as null — it is uploaded separately via uploadAvatar.
   * - Sends invitation email (non-blocking, logs failure)
   * - Returns EmployeeDetail with full relations
   */
  async create(dto: CreateEmployeeDto): Promise<EmployeeDetail> {
    // Check email uniqueness (case-insensitive)
    const existingEmail = await this.prisma.employee.findFirst({
      where: { email: { equals: dto.email, mode: "insensitive" } },
    });

    if (existingEmail) {
      throw new ConflictError("Ya existe un empleado con este email");
    }

    // Validate FK: securityRoleId exists
    const securityRole = await this.prisma.securityRole.findUnique({
      where: { id: dto.securityRoleId },
    });

    if (!securityRole) {
      throw new ValidationError(
        "securityRoleId does not reference a valid record",
        [
          {
            field: "securityRoleId",
            message: "securityRoleId does not reference a valid record",
          },
        ],
      );
    }

    // Validate FK: jobTitleId exists
    const jobTitle = await this.prisma.jobTitle.findUnique({
      where: { id: dto.jobTitleId },
    });

    if (!jobTitle) {
      throw new ValidationError(
        "jobTitleId does not reference a valid record",
        [
          {
            field: "jobTitleId",
            message: "jobTitleId does not reference a valid record",
          },
        ],
      );
    }

    // Generate username with collision resolution
    const base = this.generateUsername(dto.name, dto.firstLastName);
    const username = await this.resolveUsernameCollision(base);

    // Generate temporary password for the new employee
    const bcrypt = await import("bcrypt");
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.default.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    // mustChangePassword:true routes the employee's first login through the
    // same /auth/reset-password flow forgot-password uses, and that flow
    // always requires a security code (AuthService.resetPassword) — so one
    // has to be generated and mailed here too, or the employee gets stuck
    // on that screen with no code to enter. Long-lived (7 days) since,
    // unlike a forgot-password request, there's no telling how soon a new
    // hire actually opens the invite email.
    const code = this.generateResetCode();
    const hashedCode = await bcrypt.default.hash(code, env.BCRYPT_SALT_ROUNDS);
    const codeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create the employee record
    const created = await this.prisma.employee.create({
      data: {
        name: dto.name,
        firstLastName: dto.firstLastName,
        secondLastName: dto.secondLastName ?? null,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        username,
        password: hashedPassword,
        mustChangePassword: true,
        passwordResetCode: hashedCode,
        passwordResetCodeExpiresAt: codeExpiresAt,
        isActive: dto.isActive ?? true,
        securityRoleId: dto.securityRoleId,
        jobTitleId: dto.jobTitleId,
      },
    });

    // Re-fetch with full relations (EMPLOYEE_DETAIL_INCLUDE)
    const detail = await this.prisma.employee.findUnique({
      where: { id: created.id },
      include: EMPLOYEE_DETAIL_INCLUDE,
    });

    // Send invitation email (fire-and-forget, non-blocking)
    this.mail
      .sendMail({
        to: dto.email,
        subject: "Bienvenido a Colegio Lear",
        html: invitationEmail({
          name: dto.name,
          username,
          tempPassword,
          code,
          frontendUrl: env.FRONTEND_URL_ADMIN,
        }),
      })
      .catch((err) => {
        logger.error("Failed to send invitation email", {
          error: err,
          employeeId: created.id,
        });
      });

    return this.mapToEmployeeDetail(detail);
  }

  /**
   * Partial update of an employee.
   * - Verifies the employee exists (throws NotFoundError)
   * - Checks email uniqueness if email changed (excluding self)
   * - Does NOT regenerate username (username is immutable)
   * - Avatar is updated separately via uploadAvatar
   * - Returns EmployeeDetail with full relations
   */
  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeDetail> {
    // Verify employee exists
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Empleado no encontrado");
    }

    // Check email uniqueness if email changed (excluding self)
    if (dto.email !== undefined) {
      const duplicate = await this.prisma.employee.findFirst({
        where: {
          email: { equals: dto.email, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError("Ya existe un empleado con este email");
      }
    }

    // Build update data (only set defined fields)
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.firstLastName !== undefined)
      updateData.firstLastName = dto.firstLastName;
    if (dto.secondLastName !== undefined)
      updateData.secondLastName = dto.secondLastName;
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.securityRoleId !== undefined)
      updateData.securityRoleId = dto.securityRoleId;
    if (dto.jobTitleId !== undefined) updateData.jobTitleId = dto.jobTitleId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    // Update the record
    await this.prisma.employee.update({
      where: { id },
      data: updateData,
    });

    // Re-fetch with full relations (EMPLOYEE_DETAIL_INCLUDE)
    const detail = await this.prisma.employee.findUnique({
      where: { id },
      include: EMPLOYEE_DETAIL_INCLUDE,
    });

    return this.mapToEmployeeDetail(detail);
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the employee does not exist.
   * Throws ConflictError if the employee is already deleted.
   * Throws ConflictError if the employee (typically a teacher) is still
   * assigned to any school group calendar — deleting them would leave
   * those calendar entries (and their grade history) pointing at a
   * "deleted" employee: GET /employees/{id} 404s for isDeleted employees,
   * so any screen that separately looks up that teacher by id (outside the
   * calendar's own embedded include) breaks and falls back to showing the
   * raw id instead of a name. Deactivating (isActive: false) is the right
   * move when the teacher just needs to stop being assignable going
   * forward while keeping their history intact.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.employee.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Empleado no encontrado");
    }

    if (existing.isDeleted) {
      throw new ConflictError("El empleado ya fue eliminado");
    }

    const calendarAssignmentsCount = await this.prisma.academicCycleGroupCalendar.count({
      where: { teacherId: id },
    });
    if (calendarAssignmentsCount > 0) {
      throw new ConflictError(
        "This employee is assigned to a school group calendar and cannot be deleted. Deactivate them instead to preserve their history",
      );
    }

    await this.prisma.employee.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Resend invitation email: generates a new temporary password,
   * hashes it, updates the employee record, and sends the invitation email.
   * Throws NotFoundError if the employee does not exist.
   */
  async resendInvitation(id: string): Promise<void> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundError("Empleado no encontrado");
    }

    // Generate new temporary password
    const bcrypt = await import("bcrypt");
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.default.hash(
      tempPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    // Same security code as create() — mustChangePassword:true routes
    // through /auth/reset-password, which always requires one.
    const code = this.generateResetCode();
    const hashedCode = await bcrypt.default.hash(code, env.BCRYPT_SALT_ROUNDS);
    const codeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update password and set mustChangePassword
    await this.prisma.employee.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        passwordResetCode: hashedCode,
        passwordResetCodeExpiresAt: codeExpiresAt,
      },
    });

    // Send invitation email
    await this.mail.sendMail({
      to: employee.email,
      subject: "Invitación a Colegio Lear - Reenvío",
      html: resendInvitationEmail({
        name: employee.name,
        username: employee.username,
        tempPassword,
        code,
        frontendUrl: env.FRONTEND_URL_ADMIN,
      }),
    });
  }

  /**
   * Update the authenticated employee's own account (my account).
   * Only allows updating: name, firstLastName, secondLastName, phoneNumber.
   * Avatar is updated separately via uploadMyAvatar.
   * Returns the same shape as auth/me (LoginResponse) with securityRole+permissions and jobTitle.
   * Throws NotFoundError if the employee does not exist or is inactive.
   */
  async updateMyAccount(
    employeeId: string,
    dto: UpdateMyAccountDto,
  ): Promise<LoginResponse> {
    // Verify employee exists and is active
    const existing = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!existing || !existing.isActive) {
      throw new NotFoundError("Empleado no encontrado o inactivo");
    }

    // Update the record
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        name: dto.name,
        firstLastName: dto.firstLastName,
        secondLastName: dto.secondLastName ?? null,
        phoneNumber: dto.phoneNumber,
      },
    });

    return this.getMyAccountResponse(employeeId);
  }

  /**
   * Replace the avatar of an employee managed by an admin (POST /employees/:id/avatar).
   * Deletes the previous avatar file (if any) before storing the new one.
   * Throws NotFoundError if the employee does not exist.
   */
  async uploadAvatar(id: string, file: FileUpload): Promise<EmployeeDetail> {
    const existing = await this.prisma.employee.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError("Empleado no encontrado");
    }

    const avatar = await this.storage.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subfolder: "employees",
    });

    if (existing.avatar) {
      await this.storage.delete(existing.avatar);
    }

    await this.prisma.employee.update({
      where: { id },
      data: { avatar },
    });

    const detail = await this.prisma.employee.findUnique({
      where: { id },
      include: EMPLOYEE_DETAIL_INCLUDE,
    });

    return this.mapToEmployeeDetail(detail);
  }

  /**
   * Replace the authenticated employee's own avatar (POST /employees/me/avatar).
   * Deletes the previous avatar file (if any) before storing the new one.
   * Throws NotFoundError if the employee does not exist or is inactive.
   */
  async uploadMyAvatar(
    employeeId: string,
    file: FileUpload,
  ): Promise<LoginResponse> {
    const existing = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!existing || !existing.isActive) {
      throw new NotFoundError("Empleado no encontrado o inactivo");
    }

    const avatar = await this.storage.upload({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      subfolder: "employees",
    });

    if (existing.avatar) {
      await this.storage.delete(existing.avatar);
    }

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { avatar },
    });

    return this.getMyAccountResponse(employeeId);
  }

  /**
   * Re-fetch an employee with full relations and map to LoginResponse shape
   * (same shape as GET /auth/me). Shared by updateMyAccount and uploadMyAvatar.
   */
  private async getMyAccountResponse(
    employeeId: string,
  ): Promise<LoginResponse> {
    const updated = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        securityRole: { include: { permissions: true } },
        jobTitle: true,
      },
    });

    return {
      id: updated!.id,
      name: updated!.name,
      firstLastName: updated!.firstLastName,
      secondLastName: updated!.secondLastName,
      phoneNumber: updated!.phoneNumber,
      email: updated!.email,
      username: updated!.username,
      avatar: toPublicFileUrl(updated!.avatar),
      mustChangePassword: updated!.mustChangePassword,
      securityRole: {
        id: updated!.securityRole.id,
        name: updated!.securityRole.name,
        permissions: updated!.securityRole.permissions.map((p) => ({
          moduleKey: p.moduleKey,
          canRead: p.canRead,
          canWrite: p.canWrite,
          canDelete: p.canDelete,
        })),
      },
      jobTitle: {
        id: updated!.jobTitle.id,
        name: updated!.jobTitle.name,
        jobTitleType: toFrontendJobTitleType(updated!.jobTitle.jobTitleType),
      },
    };
  }
}
