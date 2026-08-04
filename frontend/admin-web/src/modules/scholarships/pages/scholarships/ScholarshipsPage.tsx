import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { useScholarshipsPage } from "./hooks/useScholarshipsPage";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useScholarshipsPageTable } from "./hooks/useScholarshipsPageTable";
import { ScholarshipsAdvancedFilters } from "./components/ScholarshipsAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";

export const ScholarshipsPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const canWrite = usePermission("scholarships", "can-write");
    const { loader, advancedFilters, deleteModal, queries, mutations } = useScholarshipsPage();
    const { columns, properties, actions } = useScholarshipsPageTable({ handleClickDelete: deleteModal.open });

    // Component functions
    const handleClickExport = async () => {
        loader.show("Descargando información", "Por favor espere...");

        const data = await mutations.scholarships.export.mutateAsync();

        if (!data || !Array.isArray(data)) {
            loader.hide()
            toast.info("No se cuenta con información para descargar", { position: "top-right" });
            return;
        }

        const headers: CsvHeader<ScholarshipResponse>[] = [
            { label: "Identificador", key: "id" },
            { label: "Nombre", key: "name" },
            { label: "Porcentaje de descuento", key: "discountPercentage" },
            { label: "Descripción", key: "description" },
            { label: "¿Registro activo?", key: "isActive", render: (item) => item.isActive ? "Activo" : "Inactivo" },
        ];

        downloadDataToCsvFile("Becas escolares", headers, data);

        setTimeout(() => loader.hide(), 500);
    }

    const handleClickConfirmDeleteScholarship = async () => {
        if (!deleteModal.record)
            return;
        await mutations.scholarships.delete.mutateAsync({ id: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("Beca escolar eliminada correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar la beca escolar", { position: "top-right" });
                }
            }
        );
    }

    return (
        <>
            <section className="page-main-section">

                <Breadcrumb items={[
                    { label: "Configuración escolar" },
                    { label: "Becas escolares", to: "/scholarships" },
                ]} />

                <PageTitle title="Becas escolares" subtitle="Gestiona las becas escolares que estarán disponibles en el colegio" />

                {/* Table ribbon options */}
                <TableRibbon
                    addButton={{ show: canWrite, handleClick: () => navigate("/scholarships/new") }}
                    filterButton={{ handleClick: advancedFilters.open }}
                    exportButton={{ handleClick: handleClickExport }}
                    searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
                />

                {/* Table content*/}
                <Table
                    data={queries.scholarships.paged.data}
                    isLoading={queries.scholarships.paged.isFetching}
                    enablePagination={true}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                    totalPages={queries.scholarships.paged.totalPages}
                />

                {/* Delete single record modal */}
                {
                    (deleteModal.isOpen && deleteModal.record) && (
                        <Modal
                            open={deleteModal.isOpen}
                            type="delete"
                            title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
                            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                            isLoading={mutations.scholarships.delete.isPending}
                            cancelButton={{
                                label: "Cancelar",
                                onClick: () => deleteModal.close()
                            }}
                            confirmButton={{
                                label: "Sí, eliminar",
                                onClick: handleClickConfirmDeleteScholarship
                            }}
                        />
                    )
                }

                {/* Advanced filters panel */}
                {
                    advancedFilters.isOpen && (
                        <ScholarshipsAdvancedFilters
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



