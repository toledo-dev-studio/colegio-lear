import { GraduationCap, Info, Sparkles, TrendingDown, TrendingUp, UserX } from "lucide-react";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { cn } from "@/lib/extensions/utils";
import { HighlightGradeCard } from "@/modules/academic-cycles/pages/academic-cycle-enrollment/components/student-grades/HighlightGradeCard";
import { gradeTone } from "../lib/school-subject-grades";
import type { SubjectGradesStats } from "../hooks/useSchoolSubjectGradesPage";

interface Props {
    isLoading: boolean;
    stats: SubjectGradesStats;
    minimumPassingGrade: number;
    totalStudents: number;
}

const SubjectAverageCard = ({ subjectAverage, passingCount, failingCount, minimumPassingGrade, totalStudents, hasGradedStudents }: { subjectAverage: number, passingCount: number, failingCount: number, minimumPassingGrade: number, totalStudents: number, hasGradedStudents: boolean }) => {
    const tone = gradeTone(subjectAverage, minimumPassingGrade);
    const R = 46;
    const C = 2 * Math.PI * R;
    const pct = Math.min(1, Math.max(0, subjectAverage / 10));
    const dash = C * pct;

    return (
        <section className="h-full flex flex-col items-center justify-center gap-4 bg-card hover:bg-muted/40 transition-colors rounded-lg border border-border px-5 py-10">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r={R} strokeWidth="8" className="fill-none stroke-muted" />
                    <circle
                        cx="60"
                        cy="60"
                        r={R}
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={cn(
                            "fill-none transition-all duration-500",
                            subjectAverage < minimumPassingGrade && "stroke-rose-500",
                            subjectAverage >= 9 && "stroke-emerald-500",
                            (subjectAverage >= minimumPassingGrade && subjectAverage < 9) && "stroke-sky-500"
                        )}
                        strokeDasharray={`${dash} ${C}`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-3xl font-bold font-mono leading-none ${tone.text}`}>
                        {subjectAverage.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-semibold">/ 10</p>
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Promedio de la materia</p>
                <p className={`text-sm font-semibold ${tone.text}`}>
                    {subjectAverage >= 9 ? "Excelente" : subjectAverage >= minimumPassingGrade && subjectAverage < 9 ? "Aprobado" : hasGradedStudents ? "No aprobatorio" : "Sin calificaciones"}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-border">
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Aprobados</p>
                    <p className="text-xl font-bold text-emerald-600">{passingCount}<span className="text-sm text-muted-foreground font-normal">/{totalStudents}</span></p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reprobados</p>
                    <p className="text-xl font-bold text-rose-600">{failingCount}<span className="text-sm text-muted-foreground font-normal">/{totalStudents}</span></p>
                </div>
            </div>
        </section>
    );
};

const EvaluationAverageChip = ({ evaluationNumber, value, minimumPassingGrade }: { evaluationNumber: number, value: number | undefined, minimumPassingGrade: number }) => {
    const tone = value !== undefined ? gradeTone(value, minimumPassingGrade) : null;

    return (
        <section className="bg-card border border-border rounded-lg p-3 flex flex-col items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Evaluación {evaluationNumber}º</p>
            {
                value !== undefined ? (
                    <p className={`text-lg font-mono font-bold ${tone?.text}`}>{value.toFixed(1)}</p>
                ) : (
                    <p className="text-lg font-mono font-bold text-muted-foreground">-</p>
                )
            }
        </section>
    );
};

export const SchoolSubjectGradesStats = ({ isLoading, stats, minimumPassingGrade, totalStudents }: Props) => {
    if (isLoading) {
        return (
            <section className="flex flex-col gap-y-6 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
                <Skeleton className="h-10 w-64 rounded-md" />
                <section className="grid grid-cols-1 2xl:grid-cols-3 gap-5">
                    <Skeleton className="h-72 w-full rounded-lg" />
                    <section className="grid 2xl:col-span-2 gap-5">
                        <section className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </section>
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {
                                Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} className="h-20 w-full rounded-lg" />
                                ))
                            }
                        </section>
                    </section>
                </section>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-y-6 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">

            <header className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-heading font-bold text-foreground mb-1">Calificaciones de la materia</p>
                    <p className="text-[11px] text-muted-foreground">Resumen del grupo escolar según las evaluaciones del ciclo. Escala 0–10.</p>
                </div>
            </header>

            {
                stats.sinCalificarCount > 0 && (
                    <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3">
                        <Info className="w-4 h-4 shrink-0" />
                        <p>
                            {stats.sinCalificarCount} alumno(s) aún no cuentan con calificaciones registradas para esta materia.
                        </p>
                    </section>
                )
            }

            <section className="grid grid-cols-1 2xl:grid-cols-3 gap-5">

                {/* Subject average */}
                <section className="col-span-1">
                    <SubjectAverageCard
                        subjectAverage={stats.subjectAverage}
                        passingCount={stats.passingCount}
                        failingCount={stats.failingCount}
                        minimumPassingGrade={minimumPassingGrade}
                        totalStudents={totalStudents}
                        hasGradedStudents={stats.gradedCount > 0} />
                </section>

                {/* Grades details */}
                <section className="grid 2xl:col-span-2 gap-5">

                    {/* Highlights grade cards */}
                    <section className="grid grid-cols-1 gap-3">
                        {
                            stats.best && (
                                <HighlightGradeCard
                                    icon={TrendingUp}
                                    label="Alumno con mejor promedio"
                                    value={stats.best.name}
                                    grade={stats.best.averageGrade}
                                    tone="up" />
                            )
                        }
                        {
                            stats.worst && (
                                <HighlightGradeCard
                                    icon={TrendingDown}
                                    label="Alumno con promedio más bajo"
                                    value={stats.worst.name}
                                    grade={stats.worst.averageGrade}
                                    tone={stats.worst.averageGrade >= minimumPassingGrade ? "up" : "down"} />
                            )
                        }
                        {
                            stats.sinCalificarCount > 0 && (
                                <section className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-rose-600 bg-rose-500/10">
                                        <UserX className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Alumnos sin calificar</p>
                                        <p className="text-sm font-semibold truncate">{stats.sinCalificarCount} de {totalStudents}</p>
                                    </div>
                                </section>
                            )
                        }
                    </section>

                    {/* Evaluation averages */}
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {
                            stats.evaluationAverages.map((value, index) => (
                                <EvaluationAverageChip
                                    key={index}
                                    evaluationNumber={index + 1}
                                    value={value}
                                    minimumPassingGrade={minimumPassingGrade} />
                            ))
                        }
                    </section>

                </section>

            </section>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />Mínimo aprobatorio: {minimumPassingGrade} · Promedio calculado como media simple de las evaluaciones registradas por alumno.
            </p>

        </section>
    );
}

export default SchoolSubjectGradesStats;