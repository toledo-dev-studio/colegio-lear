/**
 * Represents a single audience target for an announcement.
 * The key identifies the audience group; the label is the human-readable name.
 */
export interface AudienceItem {
  key: "administrative-staff" | "teacher" | "student";
  label: string;
}

/**
 * Filters applicable to announcements list endpoints.
 */
export interface AnnouncementFilters {
  q?: string;
  name?: string;
  status?: boolean;
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
  audience: AudienceItem[];
  content: string;
  publishedAt: Date;
  expiresAt: Date;
  status: boolean;
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
  audience: AudienceItem[];
  content?: string;
  publishedAt: string;
  expiresAt: string;
}

/**
 * Input DTO for updating an announcement (all fields optional).
 */
export interface UpdateAnnouncementDto {
  name?: string;
  description?: string;
  audience?: AudienceItem[];
  content?: string;
  publishedAt?: string;
  expiresAt?: string;
  status?: boolean;
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
