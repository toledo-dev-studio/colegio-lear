import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

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
 * Azure Blob Storage implementation.
 * Uploads to the container named by AZURE_STORAGE_CONTAINER, authenticated via
 * AZURE_STORAGE_CONNECTION_STRING. The container must have public "Blob"
 * (anonymous read) access — upload() returns the blob's URL directly, and
 * that URL is persisted as-is (see toPublicFileUrl, which passes non-local
 * provider URLs through unchanged), so it must be permanently reachable
 * without a SAS token.
 */
export class AzureStorageService implements IStorageService {
  private readonly containerClient: ContainerClient;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
    const containerName = process.env.AZURE_STORAGE_CONTAINER || "";
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  /**
   * Upload a file to the Azure Blob container.
   * Generates a unique blob name using UUID + original extension.
   * @param options - Upload options with buffer, fileName, mimeType, and subfolder
   * @returns The blob's public URL
   */
  async upload(options: UploadOptions): Promise<string> {
    const ext = path.extname(options.fileName);
    const blobName = `${options.subfolder}/${randomUUID()}${ext}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(options.buffer, {
      blobHTTPHeaders: { blobContentType: options.mimeType },
    });

    return blockBlobClient.url;
  }

  /**
   * Delete a file from the Azure Blob container.
   * No error is thrown if the blob does not exist.
   * @param filePath - The blob's public URL, as returned by upload()
   */
  async delete(filePath: string): Promise<void> {
    const blobName = this.extractBlobName(filePath);
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  /** Strips the container's base URL off a blob URL, recovering "subfolder/uuid.ext". */
  private extractBlobName(url: string): string {
    const containerUrlPrefix = `${this.containerClient.url}/`;
    return url.startsWith(containerUrlPrefix)
      ? url.slice(containerUrlPrefix.length)
      : url;
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
