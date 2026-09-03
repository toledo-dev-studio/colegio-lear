import { useNavigate } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useAcademicCyclesPage } from "./hooks/useAcademicCyclesPage";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useAcademicCyclesPageTable } from "./hooks/useAcademicCyclesPageTable";
import { AcademicCyclesAdvancedFilters } from "./components/AcademicCyclesAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";

export const AcademicCyclesPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const canWrite = usePermission("academic-cycles", "can-write");
    const { loader, advancedFilters, deleteModal, queries, mutations } = useAcademicCyclesPage();
    const { columns, properties, actions } = useAcademicCyclesPageTable({ handleClickDelete: deleteModal.open });

    // Component functions
    const handleClickExport = async () => {
        loader.show("Descargando información", "Por favor espere...");

        const data = await mutations.academicCycles.export.mutateAsync();

        if (!data || !Array.isArray(data)) {
            loader.hide();
            toast.info("No se cuenta con información para descargar", { position: "top-right" });
            return;
        }

        const headers: CsvHeader<AcademicCycleResponse>[] = [
            { label: "Identificador", key: "id" },
            { label: "Nombre", key: "name" },
            { label: "Código", key: "code" },
            { label: "Observaciones", key: "observations" },
            { label: "Minima calf. aprobatoria", key: "minimumPassingGrade" },
            { label: "Número de evaluaciones en el ciclo", key: "evaluationCount" },
            { label: "¿Inscripciones abiertas?", key: "enrollmentOpen" },
            { label: "Fecha de inicio", key: "startDate" },
            { label: "Fecha de término", key: "endDate" },
            { label: "Nivel académico", key: "academicLevel", render: (item) => item.academicLevel?.name || "" },
            { label: "Grado educativo", key: "educationLevel", render: (item) => item.educationLevel?.name || "" },
            { label: "Tipo de periodo", key: "periodType", render: (item) => labelOf(ACADEMIC_CYCLE_PERIOD_TYPES, item.periodType) },
            { label: "Estado", key: "status", render: (item) => labelOf(ACADEMIC_CYCLE_STATUSES, item.status) },
        ];

        downloadDataToCsvFile("Ciclos escolares", headers, data);

        setTimeout(() => loader.hide(), 500);
    }

    const handleClickConfirmDeleteAcademicCycle = async () => {
        if (!deleteModal.record)
            return;

        await mutations.academicCycles.delete.mutateAsync({ id: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("Ciclo escolar eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    showApiErrorToast(error, "Ocurrio un error al tratar de eliminar el ciclo escolar");
                }
            }
        );
    }

    if (queries.academicCycles.paged.isError) {
        showApiErrorToast(queries.academicCycles.paged.error, "No fue posible obtener información de los ciclos escolares");
    }

    return (
        <>
            <section className="page-main-section">

                <Breadcrumb items={[{ label: "Seguimiento escolar" }, { label: "Ciclos escolares", to: "/academic-cycles" }]} />

                <PageTitle title="Ciclos escolares" subtitle="Gestiona la información de los ciclos académicos y sus datos" />

                {/* Table ribbon options */}
                <TableRibbon
                    addButton={{ show: canWrite, handleClick: () => navigate("/academic-cycles/new") }}
                    filterButton={{ handleClick: advancedFilters.open }}
                    exportButton={{ handleClick: handleClickExport }}
                    searchInput={{ tooltip: "Búsqueda general por nombre, código & descripción", placeholder: "Búsqueda general por nombre, código & descripción" }}
                />

                {/* Table content*/}
                <Table
                    data={queries.academicCycles.paged.data}
                    isLoading={queries.academicCycles.paged.isFetching}
                    enablePagination={true}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                    totalPages={queries.academicCycles.paged.totalPages}
                />

                {/* Delete single record modal */}
                {
                    (deleteModal.isOpen && deleteModal.record) && (
                        <Modal
                            open={deleteModal.isOpen}
                            type="delete"
                            title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
                            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                            isLoading={mutations.academicCycles.delete.isPending}
                            cancelButton={{
                                label: "Cancelar",
                                onClick: () => deleteModal.close()
                            }}
                            confirmButton={{
                                label: "Sí, eliminar",
                                onClick: handleClickConfirmDeleteAcademicCycle
                            }}
                        />
                    )
                }

                {/* Advanced filters panel */}
                {
                    advancedFilters.isOpen && (
                        <AcademicCyclesAdvancedFilters
                            open={advancedFilters.isOpen}
                            title="Filtros avanzados"
                            handleClickClose={advancedFilters.close}
                        />
                    )
                }

            </section>
        </>
    )
}
