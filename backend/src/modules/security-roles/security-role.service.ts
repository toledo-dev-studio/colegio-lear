import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  ModuleKey,
  SecurityRoleFilters,
  SecurityRoleRecord,
  SecurityRoleDetail,
  CreateSecurityRoleDto,
  UpdateSecurityRoleDto,
  PagedResult,
} from "./security-role.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";

/**
 * Business logic layer for the Security Roles module.
 * Handles CRUD operations, filtering, pagination, uniqueness checks,
 * and permissions sync (Sync_Completo) using Prisma transactions.
 */
export class SecurityRoleService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided security role filters.
   * All active filters are combined with AND logic.
   * The `q` filter searches both `name` and `description` with OR logic (case-insensitive).
   */
  private buildWhereClause(
    filters: SecurityRoleFilters,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = { isDeleted: false };
    const andConditions: unknown[] = [];

    // Full-text search across name and description (OR logic, case-insensitive)
    if (filters.q) {
      andConditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      });
    }

    // Name filter (case-insensitive contains)
    if (filters.name) {
      andConditions.push({
        name: { contains: filters.name, mode: "insensitive" },
      });
    }

    // isActive filter (exact boolean match)
    if (filters.isActive !== undefined) {
      andConditions.push({ isActive: filters.isActive });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * List all security roles (no pagination) with optional filters.
   * Does NOT include permissions in the response.
   */
  async findAll(filters: SecurityRoleFilters): Promise<SecurityRoleRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.securityRole.findMany({ where });

    return results.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
    }));
  }

  /**
   * List security roles with pagination and optional filters.
   * Does NOT include permissions in the response.
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: SecurityRoleFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<SecurityRoleRecord>> {
    const where = this.buildWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.securityRole.findMany({
        where,
        skip,
        take: pagination.limit,
      }),
      this.prisma.securityRole.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
      })),
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single security role by ID with its permissions.
   * Uses Prisma `include` to fetch nested permissions in a single query.
   * Maps permissions to exclude `id` and `securityRoleId` from the response.
   * Throws NotFoundError if the role does not exist.
   */
  async findById(id: string): Promise<SecurityRoleDetail> {
    const role = await this.prisma.securityRole.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!role || role.isDeleted) {
      throw new NotFoundError("Rol no encontrado");
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: role.permissions.map((p) => ({
        moduleKey: p.moduleKey as ModuleKey,
        canRead: p.canRead,
        canWrite: p.canWrite,
        canDelete: p.canDelete,
      })),
    };
  }

  /**
   * Create a new security role with permissions.
   * Validates name uniqueness (case-insensitive).
   * Uses a Prisma $transaction to create the role and its permissions atomically.
   * Returns the created SecurityRoleDetail with permissions.
   * Throws ConflictError if a role with the same name already exists.
   */
  async create(dto: CreateSecurityRoleDto): Promise<SecurityRoleDetail> {
    // Check uniqueness: name (case-insensitive)
    const existing = await this.prisma.securityRole.findFirst({
      where: {
        name: { equals: dto.name, mode: "insensitive" },
      },
    });

    if (existing) {
      throw new ConflictError("Ya existe un rol con este nombre");
    }

    // Create role + permissions in a transaction
    const created = await this.prisma.$transaction(async (tx) => {
      const role = await tx.securityRole.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
          isActive: dto.isActive ?? true,
        },
      });

      const permissions = dto.permissions ?? [];

      if (permissions.length > 0) {
        await tx.securityRolePermission.createMany({
          data: permissions.map((p) => ({
            securityRoleId: role.id,
            moduleKey: p.moduleKey,
            canRead: p.canRead,
            canWrite: p.canWrite,
            canDelete: p.canDelete,
          })),
        });
      }

      return role;
    });

    // Re-fetch with include to return full detail with permissions
    return this.findById(created.id);
  }

  /**
   * Partial update of a security role with optional permissions sync (Sync_Completo).
   * Verifies the role exists.
   * Checks name uniqueness (case-insensitive) when name changes, excluding the current record.
   * If permissions are provided: executes Sync_Completo (deleteMany + createMany) in a transaction.
   * If permissions are NOT provided: only updates role fields without touching permissions.
   * Returns the updated SecurityRoleDetail with permissions.
   * Throws NotFoundError if the role does not exist.
   * Throws ConflictError if the new name conflicts with another record.
   */
  async update(
    id: string,
    dto: UpdateSecurityRoleDto,
  ): Promise<SecurityRoleDetail> {
    // Verify role exists
    const existing = await this.prisma.securityRole.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Rol no encontrado");
    }

    // Check uniqueness if name changed
    if (dto.name !== undefined) {
      const duplicate = await this.prisma.securityRole.findFirst({
        where: {
          name: { equals: dto.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictError("Ya existe un rol con este nombre");
      }
    }

    // Execute update in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Build update data for role fields
      const updateData: Record<string, unknown> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      // Update role fields (only if there's something to update)
      if (Object.keys(updateData).length > 0) {
        await tx.securityRole.update({
          where: { id },
          data: updateData,
        });
      }

      // Sync_Completo: if permissions provided, delete all existing and create new ones
      if (dto.permissions !== undefined) {
        await tx.securityRolePermission.deleteMany({
          where: { securityRoleId: id },
        });

        if (dto.permissions.length > 0) {
          await tx.securityRolePermission.createMany({
            data: dto.permissions.map((p) => ({
              securityRoleId: id,
              moduleKey: p.moduleKey,
              canRead: p.canRead,
              canWrite: p.canWrite,
              canDelete: p.canDelete,
            })),
          });
        }
      }
    });

    // Re-fetch with include to return full detail with permissions
    return this.findById(id);
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the role does not exist.
   * Throws ConflictError if the role is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.securityRole.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Rol no encontrado");
    }

    if (existing.isDeleted) {
      throw new ConflictError("El rol ya fue eliminado");
    }

    await this.prisma.securityRole.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
