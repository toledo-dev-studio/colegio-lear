import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge multiple class names and Tailwind classes into a single string.
 * This helper combines class values and removes duplicates using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Simulate an async delay.
 * Useful for mocking API response time during development.
 * @param ms Number of milliseconds to wait.
 * @returns Promise that resolves after the delay.
 */
export const sleep = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Convert a query string to a boolean value with a default fallback.
 * Treats the string "false" as false and any other defined value as true.
 * @param value The value to normalize.
 * @returns boolean result.
 */
export const stringToBooleanWithDefault = (value: string | null | undefined): boolean => {
    const normalizedValue = value?.trim().toLowerCase();
    if (normalizedValue === "false") {
        return false;
    }
    return true;
}

/**
 * Convert a query string to a number value with a default fallback.
 * @param value The value to normalize.
 * @returns number result.
 */
export const stringToNumberWithDefault = (value: string | null | undefined): number => {
    if (!value || isNaN(+value)) {
        return 0;
    }
    return +value;
}

/**
 * Read a nested property from an object using dot notation.
 * Example: getValueByPath(obj, 'user.address.city')
 * @param object The source object.
 * @param path Dot-separated path string.
 * @returns The nested value or undefined if not found.
 */
const getValueByPath = (object: any, path: string) => {
    return path.split('.').reduce((current, segment) => {
        if (current === null || current === undefined) {
            return undefined;
        }
        return current[segment];
    }, object);
};

/**
 * Download an array of data as a CSV file.
 * Supports nested object paths in header keys using dot notation.
 * @param fieldName File name without extension.
 * @param headers Array of header definitions with label and key.
 * @param data Data rows to convert into CSV.
 */
export const downloadDataToCsvFile = (fieldName: string, headers: { label: string, key: string }[], data: any[]) => {
    const csvHeaders = headers.map(h => h.label).join(',');
    const csvRows = data.map(item =>
        headers.map(h => {
            const value = getValueByPath(item, h.key);
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value?.toString() || '';
        }).join(',')
    );
    const csvContent = '\ufeff' + [csvHeaders, ...csvRows].join('\n');

    // Create blob and trigger browser download.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fieldName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Validates that a phone number contains at least 10 digits.
 * - Removes all non-numeric characters before validation.
 * - Returns true if valid, otherwise returns an error message string.
 */
export const isValidPhone = (value?: string) => {
    if (!value)
        return "El número de teléfono no es válido";

    const cleaned = value.replace(/\D/g, "");

    return cleaned.length >= 10 || "El número de teléfono no es válido";
};

/**
 * Formats a number into Mexican Peso currency (MXN).
 * - Uses "es-MX" locale formatting.
 * - No decimal places (rounded to integers).
 */
export const formatMoney = (n: number): string =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
    }).format(n);

/**
 * Formats an ISO date string into a human-readable date format (Spanish locale).
 * Example output: "12 March 2026"
 */
export const formatFriendlyDate = (dateString: string): string => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "long",
        day: "2-digit"
    }).format(date);
};

/**
 * Formats an ISO date string into a human-readable date and time format.
 * Includes weekday, short month, date, hour, and minutes.
 * Example output: "Mon, 12 Mar 2026, 14:30"
 */
export const formatFriendlyDateTime = (dateString: string): string => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("es-MX", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
};

/**
 * Validate an URL string.
 * @param urlString Url string to validate
 * @returns Is valid URL
 */
export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "https:";
  } catch (e) {
    return false;
  }
}

/**
 * Generate a new temporal unique identifier
 * @returns Temporal unique identifier
 */
export const generateTemporalId = () => `new_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
