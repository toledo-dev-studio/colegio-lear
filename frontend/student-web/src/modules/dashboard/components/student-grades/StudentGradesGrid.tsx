import { useMemo } from "react";
import { Info, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { OverallGradeCard } from "./OverallGradeCard";
import { StudentGradesTable } from "./StudentGradesTable";
import { HighlightGradeCard } from "./HighlightGradeCard";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";
import { computeOverallAverage, getStudentSchoolSubjectGradeSummary } from "@/lib/extensions/student-grades";

interface Props {
    studentGrades: StudentGradeResponse[]
    enrollmentId: string;
    academicCycleSchoolGroupId: string;
    academicCycleId: string;
    evaluationCount: number;
    minimumPassingGrade: number;
}

export const StudentGradesGrid = ({ studentGrades, academicCycleSchoolGroupId, academicCycleId, evaluationCount, minimumPassingGrade }: Props) => {
    const gradeSummary = getStudentSchoolSubjectGradeSummary(studentGrades);
    const overall = useMemo(() => computeOverallAverage(gradeSummary), [studentGrades]);
    const passingCount = gradeSummary.filter((g) => g.averageGrade >= minimumPassingGrade).length;
    const failingCount = gradeSummary.length - passingCount;

    const highest = gradeSummary.length ? gradeSummary.reduce((a, b) => (a.averageGrade >= b.averageGrade ? a : b)) : null;
    const lowest = gradeSummary.length ? gradeSummary.reduce((a, b) => (a.averageGrade <= b.averageGrade ? a : b)) : null;

    return (
        <>
            <section className="flex flex-col gap-y-6">

                {
                    studentGrades.length === 0 && (
                        <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3">
                            <Info className="w-4 h-4 shrink-0" />
                            <p>Aún no se han registrado calificaciones del alumno para este ciclo escolar.</p>
                        </section>
                    )
                }

                {
                    studentGrades.length > 0 && (
                        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-5">

                            {/* Overall grade */}
                            <section className="col-span-1">

                                <OverallGradeCard
                                    overall={overall ?? 0}
                                    passingCount={passingCount}
                                    failingCount={failingCount}
                                    totalSchoolSubjects={gradeSummary.length}
                                    minimumPassingGrade={minimumPassingGrade}
                                />

                            </section>

                            {/* Grades details */}
                            <section className="grid 2xl:col-span-2 gap-5">

                                {/* Highlights grade cards */}
                                <section className="grid grid-cols-2 gap-3">
                                    {highest && (
                                        <HighlightGradeCard
                                            icon={TrendingUp}
                                            label="Materia con mejor nota"
                                            value={highest.schoolSubjectName}
                                            grade={highest.averageGrade}
                                            tone="up"
                                        />
                                    )}
                                    {lowest && (
                                        <HighlightGradeCard
                                            icon={TrendingDown}
                                            label="Materia más baja"
                                            value={lowest.schoolSubjectName}
                                            grade={lowest.averageGrade}
                                            tone={lowest.averageGrade >= minimumPassingGrade ? "up" : "down"}
                                        />
                                    )}
                                </section>

                                {/* School subjects grades details table */}
                                <section className="grid grid-cols-1">
                                    <StudentGradesTable
                                        academicCycleId={academicCycleId}
                                        evaluationCount={evaluationCount}
                                        minimumPassingGrade={minimumPassingGrade}
                                        academicCycleSchoolGroupId={academicCycleSchoolGroupId}
                                        gradeSummary={gradeSummary} />
                                </section>

                            </section>



                        </section>
                    )
                }

                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />Mínimo aprobatorio: {minimumPassingGrade} · Promedio calculado como media simple de todas las materias del ciclo escolar.
                </p>

            </section>
        </>
    )
}
