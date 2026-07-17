import { gradeTone, type StudentSchoolSubjectGradeSummary } from "../lib/student-grades";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import type { AcademicCycleSchoolGroupTeacherResponse } from "@/interfaces/responses/academic-cycle-school-group-teacher.response";

interface Props {
    academicCycleResponse: AcademicCycleResponse;
    studentSchoolSubjectGradeSummary: StudentSchoolSubjectGradeSummary[];
    schoolGroupTeachersResponse: AcademicCycleSchoolGroupTeacherResponse[];
}

export const StudentGradesTable = ({ academicCycleResponse, studentSchoolSubjectGradeSummary, schoolGroupTeachersResponse }: Props) => {

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
                                Array.from({ length: academicCycleResponse.evaluationCount ?? 0 }, (_, index) => index + 1).map((index: number) => (
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
                            (!studentSchoolSubjectGradeSummary.length) && (
                                <tr>
                                    <td colSpan={5 + academicCycleResponse.evaluationCount} className="no-content-row">
                                        No se encontraron registros de pagos realizados en la cartera del alumno.
                                    </td>
                                </tr>
                            )
                        }

                        {/* Content */}
                        {
                            (studentSchoolSubjectGradeSummary.length > 0) && (
                                <>
                                    {

                                        studentSchoolSubjectGradeSummary.map((item) => {

                                            const teacher = schoolGroupTeachersResponse.find(t => t.schoolSubjectId === item.schoolSubjectId)?.teacher;
                                            const grades = item.grades;
                                            const tone = gradeTone(item.averageGrade, academicCycleResponse.minimumPassingGrade);

                                            return (
                                                <tr key={item.schoolSubjectId} className="hover:bg-muted/40 transition-colors">
                                                    <td className="row">{item.schoolSubjectName}</td>
                                                    <td className="row">
                                                        {
                                                            teacher ? `${teacher.name ?? ""} ${teacher.firstLastName ?? ""} ${teacher.secondLastName ?? ""}` : "-"
                                                        }
                                                    </td>
                                                    {
                                                        Array.from({ length: academicCycleResponse.evaluationCount ?? 0 }, (_, index) => index + 1).map((index: number) => (
                                                            <th key={index} className="row">
                                                                {
                                                                    grades.find(g => g.evaluationNumber === index)?.grade || "-"
                                                                }
                                                            </th>
                                                        ))
                                                    }
                                                    <td className="row">{item.averageGrade}</td>
                                                    <td className={`row ${tone.text}`}>{item.averageGrade >= academicCycleResponse.minimumPassingGrade ? "Aprobado" : "No aprobado"}</td>
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
