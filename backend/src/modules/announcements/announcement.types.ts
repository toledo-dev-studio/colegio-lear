/**
 * Audience key identifying a target group for an announcement.
 * The human-readable label is a presentation-layer concern owned by the
 * frontend catalog (AUDIENCE_TYPES) and is not persisted.
 */
export type AudienceKey = "administrative-staff" | "teacher" | "student";

/**
 * Filters applicable to announcements list endpoints.
 */
export interface AnnouncementFilters {
  q?: string;
  name?: string;
  isActive?: boolean;
  publishedAt?: string; // ISO date string (day filter)
  expiresAt?: string; // ISO date string (day filter)
}

/**
 * Row returned from announcements list queries (without attachments).
 */
export interface AnnouncementRecord {
  id: string;
  name: string;
  description: string | null;
  audience: AudienceKey[];
  content: string;
  publishedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  /** Calculated (cron-maintained) audience size at last recalculation. */
  recipientsCount: number;
  /** Calculated (cron-maintained) count of recipients who viewed it. */
  viewedCount: number;
  /** When recipientsCount/viewedCount were last recalculated, if ever. */
  viewsCalculatedAt: Date | null;
}

/**
 * Attachment record as returned in announcement detail responses.
 * Defined inline to avoid circular dependencies with the attachments module.
 */
export interface AttachmentRecord {
  id: string;
  url: string;
  name: string;
  extension: string;
  relatedRecordId: string;
}

/**
 * Detail response for findById (includes attachments).
 */
export interface AnnouncementDetail extends AnnouncementRecord {
  attachments: AttachmentRecord[];
}

/**
 * Input DTO for creating an announcement.
 * Content is optional at creation time (added later via update).
 */
export interface CreateAnnouncementDto {
  name: string;
  description?: string;
  audience: AudienceKey[];
  content?: string;
  publishedAt: string;
  expiresAt: string;
  isActive?: boolean;
}

/**
 * Input DTO for updating an announcement (all fields optional).
 */
export interface UpdateAnnouncementDto {
  name?: string;
  description?: string;
  audience?: AudienceKey[];
  content?: string;
  publishedAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

/**
 * Result of a paginated query.
 */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
