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
export const stringToNumberWithDefault = (value: string | null | undefined, defaultValue: any = 0): number => {
    if (!value || isNaN(+value)) {
        return defaultValue;
    }
    return +value;
}
