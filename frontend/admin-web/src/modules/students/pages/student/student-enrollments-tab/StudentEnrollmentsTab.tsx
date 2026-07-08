import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useStudentEnrollmentsTab } from "./hooks/useStudentEnrollmentsTab";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useStudentEnrollmentsTabTable } from "./hooks/useStudentEnrollmentsTabTable";

export const StudentEnrollmentsTab = () => {
    // Context hooks and stores configuration
    const { context, queries } = useStudentEnrollmentsTab();

    // Component hooks and stores
    const [searchQuery, setSearchQuery] = useState("");
    const { columns, properties, actions } = useStudentEnrollmentsTabTable({ student: context.student });

    // Filtering data using memo
    const associatedSchoolSubjects = useMemo(() => {
        const data = queries.enrollments.get.data ?? [];

        if (!searchQuery.trim())
            return data;

        const query = searchQuery.toLowerCase();

        return data.filter(item =>
            item.code?.toLowerCase().includes(query) || item.academicCycle?.name?.toLowerCase().includes(query)
        );
    }, [queries.enrollments.get.data, searchQuery]);

    if (queries.enrollments.get.isError) {
        toast.error("No fue posible obtener información de las inscripciones asociadas al estudiante", { position: "top-right" });
    }

    return (
        <>
            {/* Student enrollments section */}
            <section className="flex flex-col gap-y-8">

                <SectionTitle
                    title="INCRIPCIONES DEL ESTUDIANTE"
                    description="En esta sección de la pantalla podrás ver y acceder a la información de las inscripciones a ciclos escolares en los que el estudiante se encuentra o estuvo inscrito, además de poder acceder al detalle de cada inscripción." />

                <TableRibbon
                    className="mb-0"
                    filterButton={{ show: false }}
                    exportButton={{ show: false }}
                    addButton={{ show: false }}
                    searchInput={{
                        show: true,
                        disabled: queries.enrollments.get.isLoading || queries.enrollments.get.isError,
                        placeholder: "Búsqueda por código de inscripción o ciclo escolar",
                        tooltip: "Búsqueda por código de inscripción o ciclo escolar",
                        onKeyDown: () => { },
                        onChange: (event) => setSearchQuery(event.target.value || ""),
                        onClickClear: () => setSearchQuery("")
                    }}
                />
                <Table
                    data={associatedSchoolSubjects}
                    isLoading={queries.enrollments.get.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />

            </section>
        </>
    )
}
