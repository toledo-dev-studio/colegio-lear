/**
 * Type: Filter
 * Description: Represents a filter for a day attendance record of a student in an
 * academic cycle enrollment. Attendance is recorded per day, not per subject.
 */
export interface StudentAssistFilter {
    /**
     * Day the attendance was recorded (ISO date)
     */
    fromDate?: string;
    /**
     * Day the attendance was recorded (ISO date)
     */
    toDate?: string;
}
