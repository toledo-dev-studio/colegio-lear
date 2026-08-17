/**
 * Sanitize a file name to prevent upload failures
 * @param fileName File name text
 * @returns Sanitized file name
 */
export const sanitizeFileName = (fileName: string) => fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");

/**
 * Extract the file extension using file name
 * @param fileName File name text
 * @returns File extension
 */
export const extractFileExtension = (fileName: string): string => {
    const idx = fileName.lastIndexOf(".");
    if (idx < 0 || idx === fileName.length - 1) return "";
    return fileName.slice(idx + 1).toLowerCase();
};
