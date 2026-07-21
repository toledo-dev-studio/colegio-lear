/**
 * Type: Response
 * Description: Interface to represent top group with mayor grade in active academic cycles
 */
export interface TopSchoolGroupResponse {
    /**
     * Unique identifier for the academic cycle group
     */
    id: string;
    /**
     * Name of the academic cycle group
     * Example: "Primero A (2026-2027)"
     */
    name: string;
    /**
     * Academic cycle name
     */
    academicCycleName: string;
    /**
     * Average group grade
     */
    averageGrade: number;
    /**
     * Student enrolled to specific group count
     */
    studentsCount: number;
}

/**
 * Type: Response
 * Description: Interface to represent the summary about academi cycles
 */
export interface AcademicCycleSummaryResponse {
    /**
     * Active academic cycles count
     */
    activeAcademicCyclesCount: number;
    /**
     * Active students enrolled count in any active academic cycles
     */
    activeStudentsCount: number;
    /**
     * Dropped students enrolled count in any active academic cycles
     */
    droppedStudentsCount: number;
    /**
     * Top school groups with better grade
     */
    topGroups: TopSchoolGroupResponse[];
}

/**
 * Type: Response
 * Description: Interface to represent financial summary in the school
 */
export interface FinancialSummaryResponse {
    /**
     * Total amount paid for student wallet in active academic cycles
     */
    totalPaidAmount: number;
    /**
     * Pending amount for student wallet in active academic cycles
     */
    pendingAmount: number;
    /**
     * Forgiven amount for student wallet in active academic cycles
     */
    forgivenPaymentsCount: number;
    /**
     * Total forgiven count for student wallet in active academic cycles
     */
    totalForgivenAmount: number;
}

/**
 * Type: Response
 * Description: Announcement summary response with count of active announcement an viewed percentage
 */
export interface AnnouncementSummaryResponse {
    /**
     * Current active announcement count
     */
    activeAnnouncementsCount: number;
    /**
     * Viewed percentage for active announcement count
     */
    viewedPercentage: number;
}

/**
 * Type: Response
 * Description: System summary response
 */
export interface SystemSummaryResponse {
    /**
     * Total security role count
     */
    securityRolesCount: number;
    /**
     * Total job titles count
     */
    jobTitlesCount: number;
    /**
     * Total employees as teacher count
     */
    teachersEmployeesCount: number;
    /**
     * Total employees as administrative count
     */
    administrativeEmployeesCount: number;
}

/**
 * Type: Response
 * Description: Employee as teacher response for dashboard summary
 */
export interface TeacherEmployeeSummaryResponse {
    /**
     * Employee unique identifier
     */
    id: string;
    /**
     * Employee full name
     */
    fullName: string;
    /**
     * Employee email address
     */
    email: string;
    /**
     * Created datetime (ISO string)
     */
    createdAt: string;
    /**
     * Employee avatar
     */
    image: string;
}
