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
 * Validate an URL string.
 * @param value Url string to validate
 * @returns Is valid URL
 */
export const isValidUrl = (value: string): boolean => {
    try {
        const url = new URL(value);
        return url.protocol === "https:";
    } catch (e) {
        return false;
    }
};

/**
 * Validates that an email address has a valid format.
 * @param value Email address to validate
 * - Returns true if valid, otherwise returns an error message string.
 */
export const isValidEmail = (value?: string) => {
    if (!value)
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};
