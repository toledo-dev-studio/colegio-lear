import { ClipboardList } from "lucide-react";

import { useAttendancePage } from "../hooks/useAttendancePage";
import { AssistsTable } from "../components/assists-table/AssistsTable";
import { AssistsFilter } from "../components/assists-filter/AssistsFilter";
import { CardHeader } from "@/shared/components/card-header/CardHeader";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";

export const AttendancePage = () => {
    const { context, queries } = useAttendancePage();

    const assists = queries.assistsQuery.data.data;

    return (
        <>
            <section className="page-main-section">

                {/* Page title */}
                <ModulePageTitle
                    icon={ClipboardList}
                    badge="Asistencia escolar"
                    title="Asistencia escolar, "
                    description="Consulta el registro diario de tus asistencias, con la posibilidad de filtrar por rango de fechas para revisar un periodo específico."
                    studentName={context.student?.fullName}
                    cycle={context.academicCycle}
                />

                {/* Attendance register */}
                <section className="card">

                    <CardHeader
                        icon={ClipboardList}
                        title="Registro de asistencias"
                        description="Día por día podrás ver si asististe a clases y, en caso de inasistencia, la razón registrada."
                        tone="primary"
                    />

                    <AssistsFilter />

                    <AssistsTable
                        assists={assists}
                        isLoading={queries.assistsQuery.isLoading}
                        totalPages={queries.assistsQuery.data.totalPages}
                    />

                </section>

            </section>
        </>
    )
}
