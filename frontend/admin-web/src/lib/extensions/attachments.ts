import {
    FileImageIcon,
    FileSpreadsheet,
    FileText,
    File as FileIcon,
    Presentation,
} from "lucide-react";

import { DEFAULT_IMAGE_EXTENSIONS } from "@/lib/constants/attachment.constants";

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

/**
 * Resolve the lucide icon (with color and background styles) for a file extension
 * @param ext File extension
 * @returns Icon component, text color and background classes
 */
export const getAttachmentFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (e === "pdf") return { Icon: FileText, color: "text-red-500", bg: "bg-red-500/10" };
    if (e === "docx" || e === "doc") return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" };
    if (e === "xlsx" || e === "xls" || e === "csv") return { Icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (e === "ppt" || e === "pptx") return { Icon: Presentation, color: "text-orange-500", bg: "bg-orange-500/10" };
    if (DEFAULT_IMAGE_EXTENSIONS.includes(`.${e}`)) return { Icon: FileImageIcon, color: "text-violet-500", bg: "bg-violet-500/10" };
    return { Icon: FileIcon, color: "text-muted-foreground", bg: "bg-muted" };
};

/**
 * Download a file from a given url triggering the browser download.
 * @param url File url to download
 * @param fileName File name to save
 * @returns Promise that resolves when the download was triggered
 */
export const downloadFileFromUrl = async (url: string, fileName: string): Promise<void> => {
    const response = await fetch(url);

    if (!response.ok)
        throw new Error(`No fue posible descargar el archivo (${response.status})`);

    const blob = await response.blob();

    // Create blob and trigger browser download.
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.setAttribute("href", objectUrl);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
};
