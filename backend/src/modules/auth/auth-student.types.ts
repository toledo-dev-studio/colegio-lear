/**
 * JWT payload data stored in the student access token.
 */
export interface StudentJwtPayloadData {
  studentId: string;
  email: string;
}

/** Minimal academic cycle view embedded in an enrollment (student portal only). */
export interface StudentAuthAcademicCycleView {
  id: string;
  name: string;
  code: string;
  periodType: string;
  status: string;
  minimumPassingGrade: number;
  evaluationCount: number;
  startDate: string;
  endDate: string;
}

/** Minimal school group view embedded in an enrollment (student portal only). */
export interface StudentAuthSchoolGroupView {
  name: string;
  description: string | null;
}

/** Minimal scholarship view embedded in an enrollment (student portal only). */
export interface StudentAuthScholarshipView {
  name: string;
  discountPercentage: number;
}

/** Single enrollment entry within the student auth response. */
export interface StudentAuthEnrollmentView {
  id: string;
  status: string;
  academicCycleId: string;
  academicCycle: StudentAuthAcademicCycleView;
  academicCycleSchoolGroupId: string;
  academicCycleSchoolGroup: StudentAuthSchoolGroupView;
  scholarship: StudentAuthScholarshipView | null;
}

/**
 * Auth response shape for the student portal — deliberately minimal (only
 * fields student-web actually consumes; see SERVICIOS_PORTAL_ALUMNO.md §3.1).
 * Returned by both POST /auth/student/login and GET /auth/student/me.
 */
export interface StudentAuthResponse {
  id: string;
  fullName: string;
  enrollment: string;
  avatar: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  enrollments: StudentAuthEnrollmentView[];
}

/** Result returned by StudentAuthService.login. */
export interface StudentAuthLoginResult {
  token: string;
  student: StudentAuthResponse;
}
