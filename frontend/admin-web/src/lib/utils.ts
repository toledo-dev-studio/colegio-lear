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
export const stringToBooleanWithDefault = (value: string | null | undefined) : boolean => {
    const normalizedValue = value?.trim().toLowerCase();
    if (normalizedValue === "false") {
        return false;
    }
    return true;
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
