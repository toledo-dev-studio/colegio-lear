import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

/**
 * Type: Local
 * Description: Represents the computed grades summary of a student for a single school subject.
 */
export interface StudentSubjectGrade {
    /**
     * Identifier of the associated academic cycle enrollment
     */
    academicCycleEnrollmentId: string;
    /**
     * Grade value per evaluation number (1..evaluationCount)
     */
    gradesByEvaluation: Record<number, number>;
    /**
     * Number of evaluations with a registered grade (a grade of 0 counts as registered)
     */
    gradeCount: number;
    /**
     * Simple average of the student grades (1 decimal)
     */
    averageGrade: number;
}

/**
 * Compute the simple average of the given values rounded to 1 decimal
 * @param values Grade values
 * @returns Average grade (0 when there are no values)
 */
export const averageOf = (values: number[]): number => {
    if (values.length === 0) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
};

/**
 * Group a flat grade list per academic cycle enrollment computing the average of each student
 * @param grades Flat grades list of a school subject
 * @returns Per student summary
 */
export const getStudentGradesGroupedByEnrollment = (grades: StudentGradeResponse[]): StudentSubjectGrade[] => {
    const grouped = new Map<string, StudentGradeResponse[]>();

    for (const grade of grades) {
        const current = grouped.get(grade.academicCycleEnrollmentId) ?? [];
        current.push(grade);
        grouped.set(grade.academicCycleEnrollmentId, current);
    }

    return Array.from(grouped.entries()).map(([academicCycleEnrollmentId, items]) => {
        const gradesByEvaluation: Record<number, number> = {};
        for (const item of items)
            gradesByEvaluation[item.evaluationNumber] = item.grade;

        return {
            academicCycleEnrollmentId,
            gradesByEvaluation,
            gradeCount: items.length,
            averageGrade: averageOf(items.map((item) => item.grade)),
        };
    });
};

/**
 * Compute the school subject average of a group (simple mean of the student averages, 1 decimal)
 * @param students Per student summaries with grades
 * @returns Subject average grade (0 when there are no graded students)
 */
export const computeSubjectAverage = (students: StudentSubjectGrade[]): number => {
    if (students.length === 0) return 0;
    return Math.round((students.reduce((sum, student) => sum + student.averageGrade, 0) / students.length) * 10) / 10;
};

/**
 * Compute the group average per evaluation number (1..evaluationCount)
 * @param grades Flat grades list of a school subject
 * @param evaluationCount Number of evaluations of the academic cycle
 * @returns Average grade per evaluation (undefined when an evaluation has no grades)
 */
export const computeEvaluationAverages = (grades: StudentGradeResponse[], evaluationCount: number): (number | undefined)[] => {
    return Array.from({ length: evaluationCount }, (_, index) => {
        const values = grades
            .filter((grade) => grade.evaluationNumber === index + 1)
            .map((grade) => grade.grade);
        return values.length > 0 ? averageOf(values) : undefined;
    });
};

/**
 * Resolve the tone classes of a grade according to the minimum passing grade (same scheme of student-web)
 * @param grade Grade value
 * @param passing Minimum passing grade
 * @returns Chip, text and bar classes
 */
export const gradeTone = (grade: number, passing: number): { chip: string; text: string; bar: string } => {
    if (grade < passing) return { chip: "bg-rose-500/10 text-rose-600 border-rose-200/40", text: "text-rose-600", bar: "bg-rose-500" };
    if (grade >= 9) return { chip: "bg-emerald-500/10 text-emerald-600 border-emerald-200/40", text: "text-emerald-600", bar: "bg-emerald-500" };
    return { chip: "bg-sky-500/10 text-sky-600 border-sky-200/40", text: "text-sky-600", bar: "bg-sky-500" };
};