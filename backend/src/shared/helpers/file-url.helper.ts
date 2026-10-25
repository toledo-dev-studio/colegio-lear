import { env } from "../config/env.config";

/**
 * Converts a stored file path into one the browser can actually load.
 * SupabaseStorageService returns bare relative paths ("employees/uuid.jpg") —
 * this prefixes them with the public URL of the Supabase Storage bucket so
 * <img src> tags resolve. Values already absolute (e.g. legacy rows holding
 * a full URL) pass through unchanged.
 * Never persisted — only applied when serializing a response.
 */
export function toPublicFileUrl(filePath: string): string;
export function toPublicFileUrl(filePath: string | null): string | null;
export function toPublicFileUrl(filePath: string | null): string | null {
  if (!filePath) return filePath;
  if (/^https?:\/\//i.test(filePath)) return filePath;

  return `${env.SUPABASE_URL}/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/${filePath}`;
}
