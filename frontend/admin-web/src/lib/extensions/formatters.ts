/**
 * Formats a number into Mexican Peso currency (MXN).
 * - Uses "es-MX" locale formatting.
 * - No decimal places (rounded to integers).
 */
export const formatMoney = (value: number, currency = "MXN"): string =>
    new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);

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
 * Calculate the years between a date until now.
 * @param dateString Date in ISO string format
 * @returns Years
 */
export const calculateYears = (dateString: string): number => {
    const birthDate = new Date(dateString);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (
            today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate()
        );

    if (!hasHadBirthdayThisYear) {
        years--;
    }

    return years;
};

/**
 * Convert a value in a percentege value string
 * @param value Value to format in percentage
 * @returns Percentage value text
 */
export const formatPercentage = (value: number): string =>
  `${value.toFixed(1)}%`;
