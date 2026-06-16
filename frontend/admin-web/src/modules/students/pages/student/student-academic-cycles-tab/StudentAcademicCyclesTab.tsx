import { Navigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { useStudentAcademicCyclesTab } from "./hooks/useStudentAcademicCyclesTab";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useStudentAcademicCyclesTable } from "./hooks/useStudentAcademicCyclesTable";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";

export const StudentAcademicCyclesTab = () => {
    // Context hooks and stores configuration
    const { context, queries } = useStudentAcademicCyclesTab();

    // Student academic cycles table hook configuration
    const { columns, properties, actions } = useStudentAcademicCyclesTable({ student: context.student });

    if (queries.academicCyclesForStudent.isError) {
        toast.error("No fue posible obtener información de los ciclos escolares asociados al estudiante", { position: "top-right" });
        return <Navigate to="/students" />;
    }

    if (queries.academicCyclesForStudent.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando ciclo escolares" subtitle="Por favor espere..." />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Student academic cycles section */}
            <section className="flex flex-col gap-y-8">
                <TabSectionTitle
                    title="CICLOS ESCOLARES DEL ESTUDIANTE"
                    description="En esta sección de la pantalla podrás ver y acceder a la información de los ciclos escolares en los que el alumno se encuentra o estuvo inscrito, además de poder interactuar con información tales como realizar pagos a la cartera del estudiante." />

                {/* Student academic cycles table */}
                <Table
                    data={queries.academicCyclesForStudent.data}
                    isLoading={queries.academicCyclesForStudent.isFetching}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />

            </section>
        </>
    )
}
