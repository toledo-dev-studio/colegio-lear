/** Record returned from the student_grades table */
export interface StudentGradeRecord {
  id: string;
  grade: number;
  evaluationNumber: number;
  schoolSubjectId: string;
  schoolSubject: { id: string; name: string; description: string | null };
  academicCycleEnrollmentId: string;
}
