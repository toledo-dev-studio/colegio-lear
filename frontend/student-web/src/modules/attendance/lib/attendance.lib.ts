import { endOfWeek, startOfWeek } from "date-fns";

/**
 * Range of dates (inclusive) used to filter attendance records.
 * Dates are normalized as "yyyy-MM-dd" strings to be compared lexicographically.
 */
export interface DateRange {
    from: string;
    to: string;
}

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

/**
 * Compute the range of the current calendar week (Monday to Sunday) as
 * "yyyy-MM-dd" strings. Used as the default date filter of the attendance module.
 */
export const getCurrentWeekRange = (): DateRange => {
    const today = new Date();
    return {
        from: toISODay(startOfWeek(today, { weekStartsOn: 1 })),
        to: toISODay(endOfWeek(today, { weekStartsOn: 1 })),
    };
};
