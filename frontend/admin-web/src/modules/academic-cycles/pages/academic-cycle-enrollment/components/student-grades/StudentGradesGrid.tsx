import { useMemo } from "react";
import { GraduationCap, Info, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { OverallGradeCard } from "./OverallGradeCard";
import { StudentGradesTable } from "./StudentGradesTable";
import { HighlightGradeCard } from "./HighlightGradeCard";
import { StudentGradesGridSkeleton } from "./StudentGradesGridSkeleton";
import { computeOverallAverage, getStudentSchoolSubjectGradeSummary } from "../../lib/student-grades";
import { useGetStudentGrades } from "@/modules/academic-cycles/hooks/student-grades/useGetStudentGrades";

interface Props {
    enrollmentId: string;
    academicCycleSchoolGroupId: string;
    academicCycleId: string;
    evaluationCount: number;
    minimumPassingGrade: number;
}

export const StudentGradesGrid = ({ enrollmentId, academicCycleSchoolGroupId, academicCycleId, evaluationCount, minimumPassingGrade }: Props) => {
    // Component hooks & stores
    const { data, isLoading } = useGetStudentGrades({ academicCycleId: academicCycleId, academicCycleEnrollmentId: enrollmentId });

    const gradeSummary = getStudentSchoolSubjectGradeSummary(data);
    const overall = useMemo(() => computeOverallAverage(gradeSummary), [data]);
    const passingCount = gradeSummary.filter((g) => g.averageGrade >= minimumPassingGrade).length;
    const failingCount = gradeSummary.length - passingCount;

    const highest = gradeSummary.length ? gradeSummary.reduce((a, b) => (a.averageGrade >= b.averageGrade ? a : b)) : null;
    const lowest = gradeSummary.length ? gradeSummary.reduce((a, b) => (a.averageGrade <= b.averageGrade ? a : b)) : null;

    if (isLoading) {
        return (
            <>
                <StudentGradesGridSkeleton />
            </>
        )
    }

    return (
        <>
            <section className="flex flex-col gap-y-6 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">

                <header className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-heading font-bold text-foreground mb-1">Seguimiento académico</p>
                        <p className="text-[11px] text-muted-foreground">Calificación general del ciclo y desglose por materia. Escala 0–10.</p>
                    </div>
                </header>

                {
                    data.length === 0 && (
                        <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3">
                            <Info className="w-4 h-4 shrink-0" />
                            <p>Aún no se han registrado calificaciones del alumno para este ciclo escolar.</p>
                        </section>
                    )
                }

                {
                    data.length > 0 && (
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
