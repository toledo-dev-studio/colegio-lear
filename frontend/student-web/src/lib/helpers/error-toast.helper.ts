import { toast } from "sonner";
import { isAxiosError } from "axios";

import type { ErrorResponse } from "@/interfaces/responses/error.response";

/**
 * File name prefix for downloaded error detail files
 */
const ERROR_DETAIL_FILE_PREFIX = "error-detalle";

interface ApiErrorPayload {
    message: string;
    details: string;
}

const hasText = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

/**
 * Extract the backend error payload from an unknown error.
 * Falls back to the provided message when the backend envelope is not
 * available (network failure, timeout, mock mode, ...).
 * @param error Error captured from a query or mutation
 * @param fallbackMessage Static message to use when the backend payload is missing
 * @returns Backend message and details (details defaults to message when empty)
 */
export const getApiErrorPayload = (error: unknown, fallbackMessage: string): ApiErrorPayload => {
    if (isAxiosError<ErrorResponse>(error)) {
        const data = error.response?.data;
        if (data && typeof data === "object") {
            const message = hasText(data.message) ? data.message : fallbackMessage;
            const details = hasText(data.details) ? data.details : message;
            return { message, details };
        }
    }
    return { message: fallbackMessage, details: fallbackMessage };
};

/**
 * Download plain text content as a .txt file triggering the browser download.
 * @param fileName File name to save (with .txt extension)
 * @param content Plain text content to download
 */
export const downloadTextFile = (fileName: string, content: string): void => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);

    // Create link and trigger browser download.
    const link = document.createElement("a");
    link.setAttribute("href", objectUrl);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
};

const buildErrorDetailFileName = (): string => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `${ERROR_DETAIL_FILE_PREFIX}-${date}-${time}.txt`;
};

/**
 * Show a backend error toast with the backend message and an action button
 * to download the error details as a .txt file.
 * @param error Error captured from a query or mutation
 * @param fallbackMessage Static message to use when the backend payload is missing
 */
export const showApiErrorToast = (error: unknown, fallbackMessage: string): void => {
    const { message, details } = getApiErrorPayload(error, fallbackMessage);
    toast.error(message, {
        position: "top-right",
        action: {
            label: "Descargar detalle",
            onClick: () => downloadTextFile(buildErrorDetailFileName(), details),
        },
    });
};
