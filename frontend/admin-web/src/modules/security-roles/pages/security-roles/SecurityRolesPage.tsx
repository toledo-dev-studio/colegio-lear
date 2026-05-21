import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SecurityRolesTable } from "./components/SecurityRolesTable";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { useDeleteSecurityRole } from "../../hooks/useDeleteSecurityRole";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useExportSecurityRoles } from "../../hooks/useExportSecurityRoles";
import { useGetPagedSecurityRoles } from "../../hooks/useGetPagedSecurityRoles";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { SecurityRolesAdvancedFilters } from "./components/SecurityRolesAdvancedFilters";

export const SecurityRolesPage = () => {

    const navigate = useNavigate();

    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const [securityRoleToDelete, setSecurityRoleToDelete] = useState<SecurityRole | undefined>(undefined);

    const pagedSecurityRolesQuery = useGetPagedSecurityRoles();
    const deleteSecurityRoleMutation = useDeleteSecurityRole();
    const exportSecurityRolesMutation = useExportSecurityRoles();

    const { showLoading, hideLoading } = useLoaderStore();

    const handleClickAdvancedFilters = () => {
        setIsOpenAdvancedFiltersPanel(true);
    }

    const handleClickCloseAdvancedFiltersPanel = () => {
        setIsOpenAdvancedFiltersPanel(false);
    }

    const handleClickExport = async () => {
        showLoading("Descargando información", "Por favor espere...");
        
        const data = await exportSecurityRolesMutation.mutateAsync();

        if (!data || !Array.isArray(data)) {
            hideLoading();
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

        setTimeout(() => hideLoading(), 500);
    }

    const handleClickAdd = () => {
        navigate("/security-roles/new");
    }

    const handleClickEditRow = (item: SecurityRole) => {
        navigate(`/security-roles/${item.id}`);
    }

    const handleClickDeleteRow = (item: SecurityRole) => {
        setSecurityRoleToDelete(item);
        setIsOpenSingleDeleteModal(true);
    }

    const handleClickDelte = async () => {
        await deleteSecurityRoleMutation.mutateAsync({ id: securityRoleToDelete?.id! },
            {
                onSuccess: () => {
                    toast.success("Rol de seguridad eliminado correctamente", { position: "top-right" });
                    setSecurityRoleToDelete(undefined);
                    setIsOpenSingleDeleteModal(false);
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el rol de seguridad", { position: "top-right" });
                }
            }
        );
    }

    const handleClickCancelDelte = () => {
        setSecurityRoleToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <CustomPageTitle title="Roles de seguridad" subtitle="Gestiona los roles de seguridad y sus privilegios disponibles en la organización" />

                <div className="flex flex-col gap-8 mt-14">

                    {/* Table ribbon options */}
                    <CustomTableListRibbon
                        handleClickAdvancedFilters={handleClickAdvancedFilters}
                        handleClickAdd={handleClickAdd}
                        handleClickExport={handleClickExport}
                        disabledExport={exportSecurityRolesMutation.isPending}
                    />

                    {/* Table content*/}
                    <SecurityRolesTable
                        data={pagedSecurityRolesQuery.data}
                        isLoading={pagedSecurityRolesQuery.isFetching}
                        handleClickEditRow={handleClickEditRow}
                        handleClickDeleteRow={handleClickDeleteRow}
                    />

                    {/* Pagination top element */}
                    {
                        (!pagedSecurityRolesQuery.isFetching && pagedSecurityRolesQuery.itemsCount > 0) && (
                            <div className="flex items-center justify-center my-8">
                                <CustomPagination totalPages={pagedSecurityRolesQuery.totalPages} />
                            </div>
                        )
                    }

                    {/* Delete single record modal */}
                    {
                        securityRoleToDelete && (
                            <CustomDeleteModal
                                open={isOpenSingleDeleteModal}
                                title={`¿Estas seguro de eliminar el registro ${securityRoleToDelete?.name}`}
                                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                                isLoading={deleteSecurityRoleMutation.isPending}
                                handleClickConfirm={handleClickDelte}
                                handleClickCancel={handleClickCancelDelte}
                            />
                        )
                    }

                    {/* Advanced filters panel */}
                    {
                        isOpenAdvancedFiltersPanel && (
                            <SecurityRolesAdvancedFilters
                                open={isOpenAdvancedFiltersPanel}
                                title="Filtros avanzados"
                                handleClickClose={handleClickCloseAdvancedFiltersPanel}
                            />
                        )
                    }

                </div>
            </div>
        </>
    )
}
