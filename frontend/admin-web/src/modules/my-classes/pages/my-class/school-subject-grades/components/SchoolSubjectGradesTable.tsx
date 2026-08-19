import { Save } from "lucide-react";

import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { gradeTone } from "../lib/school-subject-grades";
import type { DraftGrades } from "../hooks/useSchoolSubjectGradesPage";
import type { StudentSubjectGrade } from "../lib/school-subject-grades";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";

interface Props {
    enrollments: AcademicCycleEnrollmentResponse[];
    studentGrades: StudentSubjectGrade[];
    draft: DraftGrades;
    evaluationCount: number;
    minimumPassingGrade: number;
    isLoading: boolean;
    isError: boolean;
    loggedInUserCanWrite: boolean;
    dirtyCount: number;
    handleChangeGrade: (enrollmentId: string, evaluationNumber: number, value: string) => void;
    handleSubmit: () => void;
}

const studentFullName = (enrollment: AcademicCycleEnrollmentResponse): string => {
    if (!enrollment.student)
        return "-";
    return `${enrollment.student.name} ${enrollment.student.firstLastName} ${enrollment.student.secondLastName}`.trim();
};

export const SchoolSubjectGradesTable = ({ enrollments = [], studentGrades = [], draft = {}, evaluationCount, minimumPassingGrade, isLoading, isError, loggedInUserCanWrite, dirtyCount, handleChangeGrade, handleSubmit }: Props) => {
    const columnsCount = 4 + evaluationCount;

    return (
        <section className="flex flex-col gap-y-5">

            {/* Section title */}
            <SectionTitle
                title="CALIFICACIONES DE LOS ALUMNOS"
                description={`Captura la calificación de cada alumno por evaluación (${evaluationCount} en el ciclo). Escala 0–10 con un decimal.`} />

            {/* Save button section */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {
                    loggedInUserCanWrite && (
                        <Button
                            className="w-full sm:w-auto"
                            disabled={dirtyCount === 0}
                            onClick={handleSubmit}>
                            <Save aria-hidden="true" />
                            Guardar calificaciones{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
                        </Button>
                    )
                }
            </section>

            <section className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="column w-10">#</th>
                            <th className="column">Alumno</th>
                            {
                                Array.from({ length: evaluationCount }, (_, index) => index + 1).map((index) => (
                                    <th key={index} className="column text-center">
                                        Evaluación {index}º
                                    </th>
                                ))
                            }
                            <th className="column text-center">Promedio</th>
                            <th className="column text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading */}
                        {
                            isLoading && (
                                Array.from({ length: 6 }).map((_, rowIndex) => (
                                    <tr key={`skeleton-row-${rowIndex}`}>
                                        {
                                            Array.from({ length: columnsCount }).map((_, columnIndex) => (
                                                <td key={columnIndex} className="row">
                                                    <Skeleton className="h-5 w-full rounded-md" />
                                                </td>
                                            ))
                                        }
                                    </tr>
                                ))
                            )
                        }

                        {/* No content */}
                        {
                            (!enrollments.length && !isLoading && !isError) && (
                                <tr>
                                    <td colSpan={columnsCount} className="no-content-row">
                                        No se encontraron alumnos inscritos para este grupo escolar.
                                    </td>
                                </tr>
                            )
                        }

                        {/* Error */}
                        {
                            isError && (
                                <tr>
                                    <td colSpan={columnsCount} className="no-content-row">
                                        No fue posible obtener las calificaciones de la materia.
                                    </td>
                                </tr>
                            )
                        }

                        {/* Content */}
                        {
                            (enrollments.length > 0 && !isLoading && !isError) && (
                                enrollments.map((enrollment, rowIndex) => {
                                    const row = studentGrades.find((item) => item.academicCycleEnrollmentId === enrollment.id);
                                    const byEvaluation = row?.gradesByEvaluation ?? {};
                                    const average = row?.averageGrade ?? 0;
                                    const tone = (row?.gradeCount ?? 0) > 0 ? gradeTone(average, minimumPassingGrade) : null;

                                    return (
                                        <tr key={enrollment.id} className="hover:bg-muted/40 transition-colors">
                                            <td className="row text-muted-foreground">{rowIndex + 1}</td>
                                            <td className="row">
                                                <p className="font-medium truncate">{studentFullName(enrollment)}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{enrollment.code}</p>
                                            </td>
                                            {
                                                Array.from({ length: evaluationCount }, (_, index) => index + 1).map((evaluationNumber) => {
                                                    const draftValue = draft[enrollment.id]?.[evaluationNumber];
                                                    const value = draftValue !== undefined ? draftValue : (byEvaluation[evaluationNumber] !== undefined ? byEvaluation[evaluationNumber].toString() : "");
                                                    return (
                                                        <td key={evaluationNumber} className="row text-center">
                                                            <Input
                                                                value={value}
                                                                disabled={!loggedInUserCanWrite}
                                                                inputMode="decimal"
                                                                placeholder="-"
                                                                className="w-16 mx-auto text-center px-0!"
                                                                onChange={(event) => handleChangeGrade(enrollment.id, evaluationNumber, event.target.value)} />
                                                        </td>
                                                    );
                                                })
                                            }
                                            <td className={`row text-center font-mono font-semibold ${tone?.text ?? "text-muted-foreground"}`}>
                                                {(row?.gradeCount ?? 0) > 0 ? average.toFixed(1) : "-"}
                                            </td>
                                            <td className={`row text-center ${tone?.text ?? "text-muted-foreground"}`}>
                                                {(row?.gradeCount ?? 0) > 0 ? (average >= minimumPassingGrade ? "Aprobado" : "No aprobado") : "Sin calificar"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )
                        }
                    </tbody>
                </table>
            </section>

            {
                !isLoading && enrollments.length > 0 && (
                    <div className="flex flex-col items-center justify-center md:flex-row md:justify-between gap-6">
                        <p className="text-sm text-muted-foreground">Viendo {enrollments.length} registro(s)</p>
                    </div>
                )
            }
        </section>
    );
}

export default SchoolSubjectGradesTable;