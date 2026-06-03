import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { useAcademicCyclesPage } from "./hooks/useAcademicCyclesPage";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { AcademicCyclesAdvancedFilters } from "./components/AcademicCyclesAdvancedFilters";


export const AcademicCyclesPage = () => {

    const { queries, mutations, loader, advancedFilters, deleteModal, tableStructure, navigate } = useAcademicCyclesPage();

    const handleClickExport = async () => {
        loader.showLoading("Descargando información", "Por favor espere...");

        const data = await mutations.exportAcademicCyclesMutation.mutateAsync();

        if (!data || !Array.isArray(data)) {
            loader.hideLoading();
            toast.info("No se cuenta con información para descargar", { position: "top-right" });
            return;
        }

        const headers = [
            { label: "Id", key: "id" },
            { label: "Nombre", key: "name" },
            { label: "Código", key: "code" },
            { label: "Fecha de inicio", key: "startDate" },
            { label: "Fecha de termino", key: "endDate" }
        ];

        downloadDataToCsvFile("Ciclos escolares", headers, data);

        setTimeout(() => loader.hideLoading(), 500);
    }

    const handleClickConfirmDelete = async () => {
        if(!deleteModal.record) 
            return;

        await mutations.deleteAcademicCycleMutation.mutateAsync({ id: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("Ciclo escolar eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el ciclo escolar", { position: "top-right" });
                }
            }
        );
    }

    return (
        <>
            <div className="w-full py-12 px-10 lg:px-15">

                <div className="mb-10">
                    <CustomBreadcrumb items={[
                        { label: "Seguimiento escolar" },
                        { label: "Ciclos escolares", to: "/academic-cycles" }
                    ]} />
                </div>

                <CustomPageTitle title="Ciclos escolares" subtitle="Gestiona la información de los ciclos académicos y sus datos" />

                <div className="flex flex-col gap-8 mt-14">

                    {/* Table ribbon options */}
                    <CustomTableListRibbon
                        handleClickAdvancedFilters={() => advancedFilters.open()}
                        handleClickAdd={() => navigate("/academic-cycles/new")}
                        handleClickExport={handleClickExport}
                        disabledExport={mutations.exportAcademicCyclesMutation.isPending}
                    />

                    {/* Table content*/}
                    <Table
                        data={queries.pagedAcademicCyclesQuery.data}
                        isLoading={queries.pagedAcademicCyclesQuery.isFetching}
                        enablePagination={true}
                        totalPages={queries.pagedAcademicCyclesQuery.totalPages}
                        columns={tableStructure.columns}
                        properties={tableStructure.properties}
                        actions={tableStructure.actions}
                    />

                    {/* Delete single record modal */}
                    {
                        deleteModal.record && (
                            <CustomDeleteModal
                                open={deleteModal.isOpen}
                                title={`¿Estas seguro de eliminar el registro ${deleteModal.record.name}`}
                                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                                isLoading={mutations.deleteAcademicCycleMutation.isPending}
                                handleClickConfirm={handleClickConfirmDelete}
                                handleClickCancel={() => deleteModal.close()}
                            />
                        )
                    }

                    {/* Advanced filters panel */}
                    {
                        advancedFilters.isOpen && (
                            <AcademicCyclesAdvancedFilters
                                open={advancedFilters.isOpen}
                                title="Filtros avanzados"
                                handleClickClose={() => advancedFilters.close()}
                            />
                        )
                    }

                </div>
            </div>
        </>
    )
}
