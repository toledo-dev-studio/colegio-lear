/**
 * This file manage the constants configuration for attachments in the application.
 */
export const DEFAULT_ACCEPTED_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf", ".docx", ".doc", ".xlsx", "xls", ".csv", ".ppt", "pptx"] as const;
export const DEFAULT_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
