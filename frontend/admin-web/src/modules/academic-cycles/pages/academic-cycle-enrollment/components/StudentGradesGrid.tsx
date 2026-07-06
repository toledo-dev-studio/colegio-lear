import { useMemo } from "react";
import { GraduationCap, Info, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { OverallGradeCard } from "./OverallGradeCard";
import { HighlightGradeCard } from "./HighlightGradeCard";
import { StudentGradesTable } from "./StudentGradesTable";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { computeOverallAverage, getStudentSchoolSubjectGradeSummary } from "../lib/student-grades";
import type { AcademicCycleSchoolGroupTeacherResponse } from "@/interfaces/responses/academic-cycle-school-group-teacher.response";

interface Props {
    academicCycleResponse: AcademicCycleResponse;
    studentGradesResponse: StudentGradeResponse[];
    schoolGroupTeachersResponse: AcademicCycleSchoolGroupTeacherResponse[];
}

export const StudentGradesGrid = ({ academicCycleResponse, studentGradesResponse, schoolGroupTeachersResponse }: Props) => {

    const gradeSummary = getStudentSchoolSubjectGradeSummary(studentGradesResponse);
    const overall = useMemo(() => computeOverallAverage(gradeSummary), [studentGradesResponse]);
    const passingCount = gradeSummary.filter((g) => g.averageGrade >= academicCycleResponse.minimumPassingGrade).length;
    const failingCount = gradeSummary.length - passingCount;

    const highest = gradeSummary.length ? gradeSummary.reduce((a, b) => (a.averageGrade >= b.averageGrade ? a : b)) : null;
    const lowest = gradeSummary.length ? gradeSummary.reduce((a, b) => (a.averageGrade <= b.averageGrade ? a : b)) : null;

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
                    studentGradesResponse.length === 0 && (
                        <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3 mt-4.5">
                            <Info className="w-4 h-4 shrink-0" />
                            <p>Aún no se han registrado calificaciones del alumno para este ciclo escolar.</p>
                        </section>
                    )
                }

                {
                    studentGradesResponse.length && (
                        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-5">

                            {/* Overall grade */}
                            <section className="col-span-1">

                            <OverallGradeCard
                                overall={overall ?? 0}
                                passingCount={passingCount}
                                failingCount={failingCount}
                                totalSchoolSubjects={gradeSummary.length}
                                minimumPassingGrade={academicCycleResponse.minimumPassingGrade}
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
                                            tone={lowest.averageGrade >= academicCycleResponse.minimumPassingGrade ? "up" : "down"}
                                        />
                                    )}
                                </section>

                                {/* School subjects grades details table */}
                                <section className="grid grid-cols-1">
                                    <StudentGradesTable
                                        academicCycleResponse={academicCycleResponse}
                                        studentSchoolSubjectGradeSummary={gradeSummary}
                                        schoolGroupTeachersResponse={schoolGroupTeachersResponse} />
                                </section>

                            </section>



                        </section>
                    )
                }

                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />Mínimo aprobatorio: {academicCycleResponse.minimumPassingGrade} · Promedio calculado como media simple de todas las materias del ciclo escolar.
                </p>

            </section>
        </>
    )
}
