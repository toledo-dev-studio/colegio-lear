import { Skeleton } from "@/shared/shadcn/ui/skeleton";
import type { StudentGradeResponse } from "@/interfaces/responses/student-grade.response";
import { gradeTone, type StudentSchoolSubjectGradeSummary } from "@/lib/extensions/student-grades";
import { useGetTeachersForAcademicCycleSchoolGroup } from "../../hooks/useGetTeachersForAcademicCycleSchoolGroup";

interface Props {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    evaluationCount: number;
    minimumPassingGrade: number;
    gradeSummary: StudentSchoolSubjectGradeSummary[]
}

export const StudentGradesTable = ({ academicCycleId, academicCycleSchoolGroupId, evaluationCount, minimumPassingGrade, gradeSummary }: Props) => {
    const { data, isLoading } = useGetTeachersForAcademicCycleSchoolGroup({ academicCycleId: academicCycleId, academicCycleSchoolGroupId: academicCycleSchoolGroupId });

    if (isLoading) {
        return (
            <>
                <section className="rounded-xl border border-border overflow-hidden">

                    {/* Header */}
                    <div className="border-b border-border p-4">
                        <Skeleton className="h-5 w-52" />
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-3 items-center gap-4 p-4"
                            >
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-24 rounded-full justify-self-end" />
                            </div>
                        ))}
                    </div>

                </section>
            </>
        )
    }

    return (
        <>
            <section className="table-container">

                <table className="table">

                    <thead>
                        {/* Columns */}
                        <tr>
                            <th className="column">Materia</th>
                            <th className="column">Docente</th>
                            {
                                Array.from({ length: evaluationCount ?? 0 }, (_, index) => index + 1).map((index: number) => (
                                    <th key={index} className="column">Evaluación {index}º</th>
                                ))
                            }
                            <th className="column">Promedio</th>
                            <th className="column">Estatus</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* No content */}
                        {
                            (!gradeSummary.length) && (
                                <tr>
                                    <td colSpan={5 + evaluationCount} className="no-content-row">
                                        No se encontraron registros de pagos realizados en la cartera del alumno.
                                    </td>
                                </tr>
                            )
                        }

                        {/* Content */}
                        {
                            (gradeSummary.length > 0) && (
                                <>
                                    {
                                        gradeSummary.map((item) => {

                                            const teacher = data.find(t => t.schoolSubjectId === item.schoolSubjectId)?.teacher;
                                            const grades: StudentGradeResponse[] = item.grades;
                                            const tone = gradeTone(item.averageGrade, minimumPassingGrade);

                                            return (
                                                <tr key={item.schoolSubjectId} className="hover:bg-muted/40 transition-colors">
                                                    <td className="row">{item.schoolSubjectName}</td>
                                                    <td className="row">
                                                        {
                                                            teacher ? `${teacher.name ?? ""} ${teacher.firstLastName ?? ""} ${teacher.secondLastName ?? ""}` : "-"
                                                        }
                                                    </td>
                                                    {
                                                        Array.from({ length: evaluationCount ?? 0 }, (_, index) => index + 1).map((index: number) => (
                                                            <th key={index} className="row">
                                                                {
                                                                    grades.find(g => g.evaluationNumber === index)?.grade || "-"
                                                                }
                                                            </th>
                                                        ))
                                                    }
                                                    <td className="row">{item.averageGrade}</td>
                                                    <td className={`row ${tone.text}`}>{item.averageGrade >= minimumPassingGrade ? "Aprobado" : "No aprobado"}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </>
                            )
                        }
                    </tbody>
                </table>

            </section>
        </>
    )
}
