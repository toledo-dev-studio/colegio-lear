import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import type {
  AnnouncementFilters,
  AnnouncementRecord,
  AnnouncementDetail,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  PagedResult,
} from "./announcement.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";

/**
 * Business logic layer for the Announcements module.
 * Handles CRUD operations, filtering (including day-range date filtering),
 * pagination, and soft delete.
 * Receives PrismaClient via constructor injection for testability.
 */
export class AnnouncementService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Build a Prisma `where` clause from the provided announcement filters.
   * All active filters are combined with AND logic.
   * - `q` searches both `name` and `description` with OR logic (case-insensitive).
   * - `name` filters by contains (case-insensitive).
   * - `status` filters by exact boolean match.
   * - `publishedAt` / `expiresAt` filter by day range (start-of-day inclusive to next day exclusive).
   */
  private buildWhereClause(
    filters: AnnouncementFilters,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = { isDeleted: false };
    const andConditions: unknown[] = [];

    // Full-text search across name and description
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

    // Status filter (exact boolean match)
    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    // PublishedAt day-range filter
    if (filters.publishedAt) {
      const start = new Date(filters.publishedAt);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      andConditions.push({ publishedAt: { gte: start, lt: end } });
    }

    // ExpiresAt day-range filter
    if (filters.expiresAt) {
      const start = new Date(filters.expiresAt);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      andConditions.push({ expiresAt: { gte: start, lt: end } });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  /**
   * List all announcements (no pagination) with optional filters.
   * Does NOT include attachments in the response (list view).
   */
  async findAll(filters: AnnouncementFilters): Promise<AnnouncementRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.announcement.findMany({ where });

    return results as unknown as AnnouncementRecord[];
  }

  /**
   * List announcements with pagination and optional filters.
   * Does NOT include attachments in the response (list view).
   * Returns a PagedResult with metadata (totalPages, currentPage, itemsCount).
   */
  async findAllPaged(
    filters: AnnouncementFilters,
    pagination: PaginationParams,
  ): Promise<PagedResult<AnnouncementRecord>> {
    const where = this.buildWhereClause(filters);
    const skip = calculateSkip(pagination);

    const [data, itemsCount] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        skip,
        take: pagination.limit,
      }),
      this.prisma.announcement.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data as unknown as AnnouncementRecord[],
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single announcement by ID with its attachments.
   * Uses Prisma `include` to fetch related attachments in a single query.
   * Throws NotFoundError if the announcement does not exist.
   */
  async findById(id: string): Promise<AnnouncementDetail> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!announcement) {
      throw new NotFoundError("Comunicado no encontrado");
    }

    return announcement as unknown as AnnouncementDetail;
  }

  /**
   * Create a new announcement.
   * Parses date strings to Date objects and sets status = true by default.
   * Content defaults to empty string when not provided (added later via update).
   * Returns the created announcement with empty attachments array.
   */
  async create(dto: CreateAnnouncementDto): Promise<AnnouncementDetail> {
    const created = await this.prisma.announcement.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        audience: JSON.parse(JSON.stringify(dto.audience)),
        content: dto.content ?? "",
        publishedAt: new Date(dto.publishedAt),
        expiresAt: new Date(dto.expiresAt),
        status: true,
      },
      include: { attachments: true },
    });

    return created as unknown as AnnouncementDetail;
  }

  /**
   * Partial update of an announcement.
   * Verifies the announcement exists before updating.
   * Parses date strings to Date objects when present.
   * Returns the updated announcement with attachments.
   * Throws NotFoundError if the record does not exist.
   */
  async update(
    id: string,
    dto: UpdateAnnouncementDto,
  ): Promise<AnnouncementDetail> {
    // Verify announcement exists
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Comunicado no encontrado");
    }

    // Build update data with only provided fields
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.audience !== undefined)
      updateData.audience = JSON.parse(JSON.stringify(dto.audience));
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.publishedAt !== undefined)
      updateData.publishedAt = new Date(dto.publishedAt);
    if (dto.expiresAt !== undefined)
      updateData.expiresAt = new Date(dto.expiresAt);
    if (dto.status !== undefined) updateData.status = dto.status;

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: updateData,
      include: { attachments: true },
    });

    return updated as unknown as AnnouncementDetail;
  }

  /**
   * Soft delete: sets isDeleted = true without removing the record.
   * Throws NotFoundError if the announcement does not exist.
   * Throws ConflictError if the announcement is already deleted.
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Comunicado no encontrado");
    }

    if (existing.isDeleted) {
      throw new ConflictError("El comunicado ya fue eliminado");
    }

    await this.prisma.announcement.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
