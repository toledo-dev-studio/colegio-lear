import { PrismaClient } from "../../generated/prisma/client";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../shared/errors/app-error";
import type {
  EmployeeFilters,
  EmployeeRecord,
  EmployeeDetail,
  PagedResult,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  FileUpload,
  SecurityRolePermissionView,
} from "./employee.types";
import {
  EMPLOYEE_LIST_INCLUDE,
  EMPLOYEE_DETAIL_INCLUDE,
} from "./employee.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";
import type { IStorageService } from "../../shared/services/storage.service";
import type { IMailService } from "../../shared/services/mail.service";
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
    const where: Record<string, unknown> = {};
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

    // Name filter (case-insensitive contains)
    if (filters.name) {
      andConditions.push({
        name: { contains: filters.name, mode: "insensitive" },
      });
    }

    // Status filter (exact boolean match)
    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    // SecurityRole filter (exact match)
    if (filters.roleId) {
      andConditions.push({ securityRoleId: filters.roleId });
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
      image: record.image,
      status: record.status,
      securityRoleId: record.securityRoleId,
      jobTitleId: record.jobTitleId,
      jobTitle: {
        id: record.jobTitle.id,
        name: record.jobTitle.name,
        description: record.jobTitle.description,
        jobTitleType: record.jobTitle.jobTitleType,
        status: record.jobTitle.status,
      },
      securityRole: {
        id: record.securityRole.id,
        name: record.securityRole.name,
        description: record.securityRole.description,
        status: record.securityRole.status,
        permissions,
      },
    };
  }

  /**
   * List all employees (no pagination) with optional filters.
   * Includes jobTitle and securityRole (without permissions).
   */
  async findAll(filters: EmployeeFilters): Promise<EmployeeRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.employee.findMany({
      where,
      include: EMPLOYEE_LIST_INCLUDE,
    });

    return results as unknown as EmployeeRecord[];
  }

  /**
   * List employees with pagination and optional filters.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: EmployeeFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<EmployeeRecord>> {
    const where = this.buildWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: pagination.limit,
        include: EMPLOYEE_LIST_INCLUDE,
      }),
      this.prisma.employee.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data as unknown as EmployeeRecord[],
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single employee by ID with full relations (securityRole with permissions).
   * Throws NotFoundError if the employee does not exist.
   */
  async findById(id: string): Promise<EmployeeDetail> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: EMPLOYEE_DETAIL_INCLUDE,
    });

    if (!employee) {
      throw new NotFoundError("Empleado no encontrado");
    }

    return this.mapToEmployeeDetail(employee);
  }

  /**
   * Create a new employee.
   * - Validates email uniqueness (case-insensitive)
   * - Validates FK references (securityRoleId, jobTitleId)
   * - Generates username with collision resolution
   * - Uploads file if present
   * - Creates record with status=true
   * - Sends invitation email (non-blocking, logs failure)
   * - Returns EmployeeDetail with full relations
   */
  async create(
    dto: CreateEmployeeDto,
    file?: FileUpload,
  ): Promise<EmployeeDetail> {
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

    // Upload file if present
    let image: string | null = null;
    if (file) {
      image = await this.storage.upload({
        buffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        subfolder: "employees",
      });
    }

    // Create the employee record
    const created = await this.prisma.employee.create({
      data: {
        name: dto.name,
        firstLastName: dto.firstLastName,
        secondLastName: dto.secondLastName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        username,
        image,
        status: true,
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
        html: `<h1>Hola ${dto.name}</h1><p>Tu usuario es: <strong>${username}</strong></p><p><a href="${env.FRONTEND_URL}">Acceder a la plataforma</a></p>`,
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
   * - Uploads file if present
   * - Does NOT regenerate username (username is immutable)
   * - Returns EmployeeDetail with full relations
   */
  async update(
    id: string,
    dto: UpdateEmployeeDto,
    file?: FileUpload,
  ): Promise<EmployeeDetail> {
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

    // Upload file if present
    let image: string | undefined;
    if (file) {
      image = await this.storage.upload({
        buffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        subfolder: "employees",
      });
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
    if (image !== undefined) updateData.image = image;

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
   * Soft delete: sets status = false without removing the record.
   * Throws NotFoundError if the employee does not exist.
   * Throws ConflictError if the employee is already inactive.
   */
  async softDelete(id: string): Promise<void> {
    // Verify employee exists
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Empleado no encontrado");
    }

    // Verify status is true (not already inactive)
    if (!existing.status) {
      throw new ConflictError("El empleado ya está inactivo");
    }

    // Set status to false
    await this.prisma.employee.update({
      where: { id },
      data: { status: false },
    });
  }
}
