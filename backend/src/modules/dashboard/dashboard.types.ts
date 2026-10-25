/** One of the top 3 active-cycle school groups ranked by average grade. */
export interface TopSchoolGroupRecord {
  id: string;
  name: string;
  academicCycleName: string;
  averageGrade: number;
  studentsCount: number;
}

/**
 * Academic cycles dashboard summary.
 * When there are no active academic cycles, activeStudentsCount,
 * droppedStudentsCount, and topGroups are all left empty/zero — there is
 * nothing to aggregate.
 */
export interface AcademicCycleSummaryRecord {
  activeAcademicCyclesCount: number;
  activeStudentsCount: number;
  droppedStudentsCount: number;
  topGroups: TopSchoolGroupRecord[];
}

/**
 * Financial (student wallet) dashboard summary, scoped to active academic
 * cycles only. All zero when there are no active cycles.
 */
export interface FinancialSummaryRecord {
  totalPaidAmount: number;
  pendingAmount: number;
  forgivenPaymentsCount: number;
  totalForgivenAmount: number;
}

/**
 * Announcements ("campaigns") dashboard summary.
 * viewedPercentage is computed from Announcement.recipientsCount/viewedCount
 * — calculated fields maintained by a (future) cron job, not by this query.
 */
export interface AnnouncementSummaryRecord {
  activeAnnouncementsCount: number;
  viewedPercentage: number;
}

/** System-wide registration counts. */
export interface SystemSummaryRecord {
  securityRolesCount: number;
  jobTitlesCount: number;
  teachersEmployeesCount: number;
  administrativeEmployeesCount: number;
}

/** One of the most recently registered teacher employees. */
export interface TeacherEmployeeSummaryRecord {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  avatar: string | null;
}
