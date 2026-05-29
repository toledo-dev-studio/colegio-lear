import { useOutletContext } from "react-router";

import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";

export const StudentAcademicCyclesTab = () => {
    // Get context from layout
    const { studentId } = useOutletContext<StudentLayoutContext>();

    console.log(studentId);


    return (
        <>
            <section className="flex flex-col gap-y-8">

                {/* Academic cycles table title */}
                <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                    <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            CICLOS ESCOLARES DEL ESTUDIANTE
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            En esta sección de la pantalla podrás ver y acceder a la información de los ciclos escolares en los que el alumno se encuentra o estuvo inscrito, además de poder interactuar con información tales como realizar pagos a la cartera del estudiante.
                        </p>
                    </div>

                    {/* Academic cylces table */}
                    <section className="table-container">
                        <table className="table">
                            <thead>
                                {/* Columns */}
                                <tr className="text-nowrap">
                                    <th className="column">Nombre & código</th>
                                    <th className="column">Fecha de inicio de ciclo</th>
                                    <th className="column">Fecha de cierre de ciclo</th>
                                    <th className="column">Estatus del ciclo</th>
                                    <th className="column">Tipo de periodo</th>
                                    <th className="column">Estatus de alumno en el ciclo</th>
                                    <th className="column">Grupo asignado</th>
                                    <th className="column">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={8} className="no-content-row py-8">
                                        No se cuenta con tutores registrados
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </section>

            </section>
        </>
    )
}
