import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useSecurityRolesPage } from "./hooks/useSecurityRolesPage";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useSecurityRolesPageTable } from "./hooks/useSecurityRolesPageTable";
import { SecurityRolesAdvancedFilters } from "./components/SecurityRolesAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";

export const SecurityRolesPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const canWrite = usePermission("security-roles", "can-write");
    const { loader, advancedFilters, deleteModal, queries, mutations } = useSecurityRolesPage();
    const { columns, properties, actions } = useSecurityRolesPageTable({ handleClickDelete: deleteModal.open });

    // Component functions
    const handleClickExport = async () => {
        loader.show("Descargando información", "Por favor espere...");

        const data = await mutations.securityRoles.export.mutateAsync();

        if (!data || !Array.isArray(data)) {
            loader.hide();
            toast.info("No se cuenta con información para descargar", { position: "top-right" });
            return;
        }

        const headers = [
            { label: "Id", key: "id" },
            { label: "Nombre", key: "name" },
            { label: "Descripción", key: "description" },
            { label: "Estado", key: "status" }
        ];

        downloadDataToCsvFile("Roles de seguridad", headers, data);

        setTimeout(() => loader.hide(), 500);
    }

    const handleClickConfirmDeleteSecurityRole = async () => {
        if (!deleteModal.record)
            return;
        await mutations.securityRoles.delete.mutateAsync({ id: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("Rol de seguridad eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el rol de seguridad", { position: "top-right" });
                }
            }
        );
    }

    return (
        <>
            <section className="page-main-section">

                <Breadcrumb items={[
                    { label: "Seguridad" },
                    { label: "Roles de seguridad", to: "/security-roles" }
                ]} />

                <PageTitle title="Roles de seguridad" subtitle="Gestiona los roles de seguridad y sus privilegios disponibles en la organización" />

                {/* Table ribbon options */}
                <TableRibbon
                    addButton={{ show: canWrite, handleClick: () => navigate("/security-roles/new") }}
                    filterButton={{ handleClick: advancedFilters.open }}
                    exportButton={{ handleClick: handleClickExport }}
                    searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
                />

                {/* Table content*/}
                <Table
                    data={queries.securityRoles.paged.data}
                    isLoading={queries.securityRoles.paged.isFetching}
                    enablePagination={true}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                    totalPages={queries.securityRoles.paged.totalPages}
                />

                {/* Delete single record modal */}
                {
                    (deleteModal.isOpen && deleteModal.record) && (
                        <Modal
                            open={deleteModal.isOpen}
                            type="delete"
                            title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
                            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                            isLoading={mutations.securityRoles.delete.isPending}
                            cancelButton={{
                                label: "Cancelar",
                                onClick: () => deleteModal.close()
                            }}
                            confirmButton={{
                                label: "Sí, eliminar",
                                onClick: handleClickConfirmDeleteSecurityRole
                            }}
                        />
                    )
                }

                {/* Advanced filters panel */}
                {
                    advancedFilters.isOpen && (
                        <SecurityRolesAdvancedFilters
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
