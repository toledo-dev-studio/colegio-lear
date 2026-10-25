import { randomUUID } from "crypto";
import * as path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.config";

/**
 * Options for file upload operations.
 */
export interface UploadOptions {
  /** File content as a Buffer */
  buffer: Buffer;
  /** Original file name (used to extract extension) */
  fileName: string;
  /** MIME type of the file (e.g. "image/jpeg") */
  mimeType: string;
  /** Subfolder to organize files by entity (e.g. "employees") */
  subfolder: string;
}

/**
 * Abstract storage service interface.
 * Services depend on this instead of a concrete backend so they can be
 * unit-tested with a mock.
 */
export interface IStorageService {
  /**
   * Upload a file and return its relative path.
   * @param options - Upload configuration including buffer, filename, mime type, and subfolder
   * @returns Relative path to the stored file (e.g. "employees/uuid.jpg")
   */
  upload(options: UploadOptions): Promise<string>;

  /**
   * Delete a file by its relative path.
   * Does not throw if the file does not exist.
   * @param filePath - Relative path of the file to delete
   */
  delete(filePath: string): Promise<void>;
}

/**
 * Supabase Storage implementation.
 * Uploads to the bucket named by SUPABASE_STORAGE_BUCKET, authenticated with
 * SUPABASE_SERVICE_ROLE_KEY (bypasses RLS, so no storage policies are needed).
 * The bucket must be public: only the relative path is persisted, and
 * toPublicFileUrl turns it into the bucket's public URL when serializing a
 * response, so it must be reachable without a signed token.
 *
 * The client is created lazily so importing this module (e.g. from the seed)
 * doesn't crash when the Supabase env vars are missing — the error surfaces
 * on the first upload/delete instead.
 */
export class SupabaseStorageService implements IStorageService {
  private client: SupabaseClient | null = null;

  private get bucket() {
    if (!this.client) {
      if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
          "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required for file storage",
        );
      }
      this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return this.client.storage.from(env.SUPABASE_STORAGE_BUCKET);
  }

  /**
   * Upload a file to the Supabase bucket.
   * Generates a unique object name using UUID + original extension.
   * @param options - Upload options with buffer, fileName, mimeType, and subfolder
   * @returns Relative path: "subfolder/uuid.ext"
   */
  async upload(options: UploadOptions): Promise<string> {
    const ext = path.extname(options.fileName);
    const objectPath = `${options.subfolder}/${randomUUID()}${ext}`;

    const { error } = await this.bucket.upload(objectPath, options.buffer, {
      contentType: options.mimeType,
      upsert: false,
    });
    if (error) throw error;

    return objectPath;
  }

  /**
   * Delete a file from the Supabase bucket.
   * No error is thrown if the object does not exist.
   * @param filePath - Relative path of the file to delete
   */
  async delete(filePath: string): Promise<void> {
    const { error } = await this.bucket.remove([filePath]);
    if (error) throw error;
  }
}

/** Singleton storage service instance used throughout the application */
export const storageService: IStorageService = new SupabaseStorageService();
