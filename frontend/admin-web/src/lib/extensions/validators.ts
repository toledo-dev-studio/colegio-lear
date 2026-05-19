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
