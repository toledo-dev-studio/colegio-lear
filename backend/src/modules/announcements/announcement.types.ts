/**
 * Audience key identifying a target group for an announcement.
 * The human-readable label is a presentation-layer concern owned by the
 * frontend catalog (AUDIENCE_TYPES) and is not persisted.
 */
export type AudienceKey = "administrative-staff" | "teacher" | "student";

/**
 * Announcement lifecycle status (frontend/API values — kebab-case).
 * Recipients are resolved and notified on the first transition into
 * "in-progress" (see AnnouncementService.update/create and
 * NotificationService.notifyAnnouncementPublished), not at creation time.
 */
export type AnnouncementStatus =
  | "draft"
  | "in-progress"
  | "completed"
  | "cancelled";

/**
 * Filters applicable to announcements list endpoints.
 */
export interface AnnouncementFilters {
  q?: string;
  name?: string;
  status?: AnnouncementStatus;
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
  status: AnnouncementStatus;
  /**
   * True once this campaign was set to "in-progress" for the first time —
   * recipients have been resolved and locked in, and the frontend no
   * longer offers "draft" as an option.
   */
  alreadyPublished: boolean;
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
 * status only accepts "draft"/"in-progress" here — "completed"/"cancelled"
 * only make sense for a campaign that has already run, so those are only
 * reachable via update.
 */
export interface CreateAnnouncementDto {
  name: string;
  description?: string;
  audience: AudienceKey[];
  content?: string;
  publishedAt: string;
  expiresAt: string;
  status?: Extract<AnnouncementStatus, "draft" | "in-progress">;
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
  status?: AnnouncementStatus;
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
