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
 * Generate a new temporal unique identifier
 * @returns Temporal unique identifier
 */
export const generateTemporalId = () => `new_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
