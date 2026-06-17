import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useSecurityRolesPage } from "./hooks/useSecurityRolesPage";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useSecurityRolesPageTable } from "./hooks/useSecurityRolesPageTable";
import { SecurityRolesAdvancedFilters } from "./components/SecurityRolesAdvancedFilters";

export const SecurityRolesPage = () => {
    // Component hooks & stores
    const navigate = useNavigate();
    const { loader, advancedFilters, deleteModal, queries, mutations } = useSecurityRolesPage();
    const { columns, properties, actions } = useSecurityRolesPageTable({ handleOnClickDelete: deleteModal.open });

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
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <CustomBreadcrumb items={[
                        { label: "Seguridad" },
                        { label: "Roles de seguridad", to: "/security-roles" }
                    ]} />
                </div>

                <CustomPageTitle title="Roles de seguridad" subtitle="Gestiona los roles de seguridad y sus privilegios disponibles en la organización" />

                <div className="flex flex-col gap-8 mt-14">

                    {/* Table ribbon options */}
                    <TableRibbon
                        handleClickAdvancedFilters={() => advancedFilters.open()}
                        handleClickAdd={() => navigate("/security-roles/new")}
                        handleClickExport={handleClickExport}
                        inputSearchPlaceholder="Búsqueda general..."
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

                </div>
            </div>
        </>
    )
}
