import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";

/**
 * Type: Local
 * Description: Represents a single class session of a school subject within the weekly schedule.
 */
export interface SchoolSubjectScheduleSession {
    /**
     * Day of the week of the session (e.g., "monday")
     */
    day: DayOfWeekKey;
    /**
     * Start time of the session (HH:mm:ss)
     */
    startTime: string;
    /**
     * End time of the session (HH:mm:ss)
     */
    endTime: string;
}

/**
 * Type: Local
 * Description: Represents a school subject assigned to the logged-in user with all its weekly sessions, derived from the school group calendar.
 */
export interface SchoolSubjectSchedule {
    /**
     * Unique identifier of the school subject
     */
    schoolSubjectId: string;
    /**
     * Name of the school subject
     */
    name: string;
    /**
     * Weekly sessions of the school subject
     */
    sessions: SchoolSubjectScheduleSession[];
}