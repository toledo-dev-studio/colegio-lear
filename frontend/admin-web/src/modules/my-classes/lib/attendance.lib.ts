/**
 * Convert a Date into a "yyyy-MM-dd" string.
 */
export const toISODay = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Normalize an ISO date string into a "yyyy-MM-dd" day key, keeping only the
 * date part so ranges can be compared day by day.
 */
export const toDayParam = (value?: string): string | undefined => value?.slice(0, 10);