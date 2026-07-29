import { env } from "../config/env.config";

/**
 * Converts a stored file path into one the browser can actually load.
 * LocalStorageService returns bare relative paths ("employees/uuid.jpg") —
 * this prefixes them with the backend's public origin + the /uploads
 * static route (see src/index.ts) so <img src> tags resolve, for local
 * testing until real blob storage is configured.
 *
 * Only touches STORAGE_PROVIDER=local paths: values already absolute
 * (e.g. a future blob-storage URL, which providers return pre-formed)
 * pass through unchanged, and this is a no-op for any other provider.
 * Never persisted — only applied when serializing a response.
 */
export function toPublicFileUrl(filePath: string): string;
export function toPublicFileUrl(filePath: string | null): string | null;
export function toPublicFileUrl(filePath: string | null): string | null {
  if (!filePath) return filePath;
  if (/^https?:\/\//i.test(filePath)) return filePath;
  if (env.STORAGE_PROVIDER !== "local") return filePath;

  return `${env.BACKEND_URL}/uploads/${filePath}`;
}
