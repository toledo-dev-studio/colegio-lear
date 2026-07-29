import { PrismaClient } from "../../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../shared/errors/app-error";
import { toPublicFileUrl } from "../../shared/helpers/file-url.helper";
import type {
  AnnouncementFilters,
  AnnouncementRecord,
  AnnouncementDetail,
  AnnouncementStatus,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  PagedResult,
} from "./announcement.types";
import type { PaginationParams } from "../../shared/helpers/pagination.helper";
import {
  calculateSkip,
  buildPaginationMeta,
} from "../../shared/helpers/pagination.helper";

// ─── Enum Mappings ──────────────────────────────────────────────────────────

/** Maps frontend/API status values (kebab-case) to Prisma enum member names */
const STATUS_TO_PRISMA: Record<string, string> = {
  "in-progress": "in_progress",
};

/** Maps Prisma enum member names back to frontend/API status values */
const STATUS_FROM_PRISMA: Record<string, AnnouncementStatus> = {
  in_progress: "in-progress",
};

function statusToPrisma(value: string): string {
  return STATUS_TO_PRISMA[value] ?? value;
}

function statusFromPrisma(value: string): AnnouncementStatus {
  return (STATUS_FROM_PRISMA[value] ?? value) as AnnouncementStatus;
}

/**
 * Explicit select for list endpoints (no attachments).
 * Excludes isDeleted so it never leaks into API responses.
 */
const LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  audience: true,
  content: true,
  publishedAt: true,
  expiresAt: true,
  status: true,
  alreadyPublished: true,
  recipientsCount: true,
  viewedCount: true,
  viewsCalculatedAt: true,
} as const;

/**
 * Explicit select for detail endpoints (includes attachments).
 * Excludes isDeleted so it never leaks into API responses.
 */
const DETAIL_SELECT = {
  ...LIST_SELECT,
  attachments: {
    select: {
      id: true,
      url: true,
      name: true,
      extension: true,
      relatedRecordId: true,
    },
  },
} as const;

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
   * - `status` filters by exact match.
   * - `publishedAt` / `expiresAt` together define one selected date range;
   *   matches announcements whose own publishedAt AND expiresAt both fall
   *   within that range.
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

    // status filter (exact match)
    if (filters.status !== undefined) {
      andConditions.push({ status: statusToPrisma(filters.status) as never });
    }

    // publishedAt/expiresAt together define one selected date range
    // ("Entre fecha de publicación" → "Hasta fecha de vencimiento" in the
    // front's advanced filters panel). Both the record's own publishedAt
    // AND its expiresAt must fall within that range — this is not two
    // independent exact-date filters, it's "does this announcement's
    // whole active window sit inside the selected window".
    if (filters.publishedAt || filters.expiresAt) {
      const rangeStart = filters.publishedAt
        ? new Date(filters.publishedAt)
        : undefined;
      if (rangeStart) rangeStart.setUTCHours(0, 0, 0, 0);

      const rangeEnd = filters.expiresAt
        ? new Date(filters.expiresAt)
        : undefined;
      if (rangeEnd) rangeEnd.setUTCHours(23, 59, 59, 999);

      const withinRange: Record<string, Date> = {};
      if (rangeStart) withinRange.gte = rangeStart;
      if (rangeEnd) withinRange.lte = rangeEnd;

      andConditions.push({ publishedAt: withinRange });
      andConditions.push({ expiresAt: withinRange });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }

  private mapRecord<T extends { status: string }>(
    raw: T,
  ): Omit<T, "status"> & { status: AnnouncementStatus } {
    const mapped = { ...raw, status: statusFromPrisma(raw.status) };

    // Detail records include attachments; list records don't.
    if ("attachments" in mapped && Array.isArray(mapped.attachments)) {
      mapped.attachments = mapped.attachments.map(
        (a: { url: string }) => ({ ...a, url: toPublicFileUrl(a.url) }),
      );
    }

    return mapped;
  }

  /**
   * List all announcements (no pagination) with optional filters.
   * Does NOT include attachments in the response (list view).
   */
  async findAll(filters: AnnouncementFilters): Promise<AnnouncementRecord[]> {
    const where = this.buildWhereClause(filters);

    const results = await this.prisma.announcement.findMany({
      where,
      select: LIST_SELECT,
    });

    return results.map((r) => this.mapRecord(r)) as unknown as AnnouncementRecord[];
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
        select: LIST_SELECT,
      }),
      this.prisma.announcement.count({ where }),
    ]);

    const meta = buildPaginationMeta(itemsCount, pagination);

    return {
      data: data.map((r) => this.mapRecord(r)) as unknown as AnnouncementRecord[],
      totalPages: meta.totalPages,
      currentPage: meta.page,
      itemsCount,
    };
  }

  /**
   * Find a single announcement by ID with its attachments.
   * Uses an explicit Prisma select to fetch related attachments in a single query
   * while excluding isDeleted from the response.
   * Throws NotFoundError if the announcement does not exist or is deleted.
   */
  async findById(id: string): Promise<AnnouncementDetail> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      select: { ...DETAIL_SELECT, isDeleted: true },
    });

    if (!announcement || announcement.isDeleted) {
      throw new NotFoundError("Comunicado no encontrado");
    }

    const { isDeleted: _isDeleted, ...detail } = announcement;

    return this.mapRecord(detail) as unknown as AnnouncementDetail;
  }

  /**
   * Create a new announcement.
   * Parses date strings to Date objects. status defaults to "draft" (or
   * dto.status when provided). Setting status to "in-progress" directly at
   * creation marks alreadyPublished=true right away — the caller (the
   * controller) is responsible for noticing this and dispatching recipient
   * notifications, since that lives in NotificationService, not here.
   * Content defaults to empty string when not provided (added later via update).
   * Returns the created announcement with empty attachments array.
   */
  async create(dto: CreateAnnouncementDto): Promise<AnnouncementDetail> {
    const status = statusToPrisma(dto.status ?? "draft");

    const created = await this.prisma.announcement.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        audience: dto.audience,
        content: dto.content ?? "",
        publishedAt: new Date(dto.publishedAt),
        expiresAt: new Date(dto.expiresAt),
        status: status as never,
        alreadyPublished: status === "in_progress",
      },
      select: DETAIL_SELECT,
    });

    return this.mapRecord(created) as unknown as AnnouncementDetail;
  }

  /**
   * Partial update of an announcement.
   * Verifies the announcement exists before updating.
   * Parses date strings to Date objects when present.
   * Throws ConflictError when trying to move a published campaign back to
   * "draft" — once recipients have been resolved there's no going back.
   * Setting status to "in-progress" for the first time marks
   * alreadyPublished=true here; same as create(), it's on the controller to
   * notice that transition and dispatch recipient notifications.
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
    if (dto.audience !== undefined) updateData.audience = dto.audience;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.publishedAt !== undefined)
      updateData.publishedAt = new Date(dto.publishedAt);
    if (dto.expiresAt !== undefined)
      updateData.expiresAt = new Date(dto.expiresAt);

    if (dto.status !== undefined) {
      const targetStatus = statusToPrisma(dto.status);

      if (targetStatus === "draft" && existing.alreadyPublished) {
        throw new ConflictError(
          "No se puede regresar a borrador una campaña que ya fue publicada",
        );
      }

      updateData.status = targetStatus as never;
      if (targetStatus === "in_progress" && !existing.alreadyPublished) {
        updateData.alreadyPublished = true;
      }
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: updateData,
      select: DETAIL_SELECT,
    });

    return this.mapRecord(updated) as unknown as AnnouncementDetail;
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
