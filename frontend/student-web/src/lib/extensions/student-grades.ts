import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";

export interface StudentSchoolSubjectGradeSummary {
    schoolSubjectId: string;
    schoolSubjectName: string;
    grades: StudentGradeResponse[];
    averageGrade: number;
}

export const computeOverallAverage = (grades: StudentSchoolSubjectGradeSummary[]): number => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.averageGrade, 0);
  return Math.round((sum / grades.length) * 10) / 10; // 1 decimal
};

export const getStudentSchoolSubjectGradeSummary = (studentGrades: StudentGradeResponse[]): StudentSchoolSubjectGradeSummary[] => {
    const grouped = new Map<string, StudentGradeResponse[]>();

    // Agrupar por materia
    for (const grade of studentGrades) {
        const current = grouped.get(grade.schoolSubjectId) ?? [];
        current.push(grade);
        grouped.set(grade.schoolSubjectId, current);
    }

    // Calcular promedio de cada materia
    return Array.from(grouped.entries()).map(([schoolSubjectId, grades]) => {
        const average =
            grades.reduce((sum, item) => sum + item.grade, 0) / grades.length;

        return {
            schoolSubjectId,
            schoolSubjectName: grades[0].schoolSubject?.name ?? "",
            grades: grades.sort(
                (a, b) => a.evaluationNumber - b.evaluationNumber
            ),
            averageGrade: Number(average.toFixed(1)),
        };
    });
};

export const gradeTone = (grade: number, passing: number): { chip: string; text: string; bar: string } => {
    if (grade < passing) return { chip: "bg-rose-500/10 text-rose-600 border-rose-200/40", text: "text-rose-600", bar: "bg-rose-500" };
    if (grade >= 9) return { chip: "bg-emerald-500/10 text-emerald-600 border-emerald-200/40", text: "text-emerald-600", bar: "bg-emerald-500" };
    return { chip: "bg-sky-500/10 text-sky-600 border-sky-200/40", text: "text-sky-600", bar: "bg-sky-500" };
};