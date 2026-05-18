import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

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
 * Implementations handle file persistence using different backends
 * (local filesystem, Azure Blob Storage, etc.).
 */
export interface IStorageService {
  /**
   * Upload a file and return the relative path/URL.
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
 * Local file system storage implementation.
 * Stores files in the directory specified by STORAGE_LOCAL_PATH env var (default: "./uploads").
 * Files are organized in subfolders by entity and named with UUIDs to avoid collisions.
 */
export class LocalStorageService implements IStorageService {
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || "./uploads";
  }

  /**
   * Upload a file to the local filesystem.
   * Generates a unique filename using UUID + original extension.
   * @param options - Upload options with buffer, fileName, mimeType, and subfolder
   * @returns Relative path: "subfolder/uuid.ext"
   */
  async upload(options: UploadOptions): Promise<string> {
    const ext = path.extname(options.fileName);
    const uniqueName = `${randomUUID()}${ext}`;
    const subfolderPath = path.join(this.basePath, options.subfolder);

    // Ensure the target directory exists
    if (!fs.existsSync(subfolderPath)) {
      fs.mkdirSync(subfolderPath, { recursive: true });
    }

    const fullPath = path.join(subfolderPath, uniqueName);
    fs.writeFileSync(fullPath, options.buffer);

    // Return relative path: subfolder/uuid.ext
    return `${options.subfolder}/${uniqueName}`;
  }

  /**
   * Delete a file from the local filesystem.
   * No error is thrown if the file does not exist.
   * @param filePath - Relative path of the file to delete
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Azure Blob Storage placeholder implementation.
 * Throws "Not implemented" on every method call.
 * Reserved for future integration with Azure Blob Storage.
 */
export class AzureStorageService implements IStorageService {
  /** @throws Error - Always throws "Not implemented" */
  async upload(_options: UploadOptions): Promise<string> {
    throw new Error(
      "AzureStorageService not implemented. Configure Azure Blob Storage credentials.",
    );
  }

  /** @throws Error - Always throws "Not implemented" */
  async delete(_filePath: string): Promise<void> {
    throw new Error(
      "AzureStorageService not implemented. Configure Azure Blob Storage credentials.",
    );
  }
}

/**
 * Factory function that returns the active storage service implementation
 * based on the STORAGE_PROVIDER environment variable.
 * Supported values: "local" (default), "azure".
 */
function createStorageService(): IStorageService {
  const provider = process.env.STORAGE_PROVIDER || "local";
  switch (provider) {
    case "azure":
      return new AzureStorageService();
    case "local":
    default:
      return new LocalStorageService();
  }
}

/** Singleton storage service instance used throughout the application */
export const storageService: IStorageService = createStorageService();
